"""
Authentication views for the social media platform.
This module handles user authentication, registration, profile management, and password reset functionality.
"""

from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from axes.decorators import axes_dispatch
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django_ratelimit.decorators import ratelimit
from axes.decorators import axes_dispatch
from .models import UserProfile, VerificationCode
from .serializers import (
    EmailSerializer, VerificationSerializer, SignupCompleteSerializer,
    ProfileSerializer, PasswordResetConfirmSerializer, CustomTokenObtainPairSerializer
)
import secrets
import string
import logging

User = get_user_model()
logger = logging.getLogger('authentication')

# Rate limit configurations
LOGIN_RATE_LIMIT = '5/m'  # 5 attempts per minute
SIGNUP_RATE_LIMIT = '10/h'  # Increased from 3/h to 10/h
PASSWORD_RESET_RATE_LIMIT = '3/h'  # 3 attempts per hour
VERIFICATION_RATE_LIMIT = '10/m'  # 10 attempts per minute

def generate_verification_code(length=6):
    """
    Generate a random 6-digit verification code for email verification and password reset.
    
    Args:
        length (int): Length of the verification code (default: 6)
    
    Returns:
        str: Random verification code
    """
    return ''.join(secrets.choice(string.digits) for _ in range(length))

@method_decorator(
    [axes_dispatch, ratelimit(key='ip', rate=LOGIN_RATE_LIMIT, method='POST', block=True), csrf_protect],
    name='dispatch'
)

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view that handles user authentication and JWT token generation.
    Includes rate limiting and brute force protection.
    """
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        """
        Handle user login requests.
        
        Args:
            request: HTTP request object containing username/email and password
            
        Returns:
            Response: JWT tokens and user data on success, error message on failure
        """
        identifier = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        remember_me = request.data.get('remember_me', False)

        if not identifier or not password:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.warning(f"Missing credentials from IP {ip_address}")
            return Response({"error": "Username or email and password required."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=identifier).first() or User.objects.filter(username=identifier).first()
        if not user:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.warning(f"Non-existent identifier {identifier} from IP {ip_address}")
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(request=request, username=user.username, password=password)
        if not user:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.warning(f"Failed login for {identifier} from IP {ip_address}")
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data.copy()
        data['username'] = user.username  # ensure serializer has username key

        try:
            serializer = self.get_serializer(data=data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            response_data = serializer.validated_data
            
            # Adjust token expiration based on remember_me
            if remember_me:
                # Set longer expiration for remember me (e.g., 30 days)
                response_data['access'] = str(RefreshToken(response_data['refresh']).access_token)
                response_data['refresh'] = str(RefreshToken.for_user(user))
            
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.info(f"Successful login for {user.username} from IP {ip_address}")
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            if 'axes.' in str(e):
                logger.warning(f"Account locked for {identifier} from IP {ip_address}")
                return Response({"error": "Account locked due to too many failed attempts."}, status=status.HTTP_403_FORBIDDEN)
            logger.error(f"Login error for {identifier}: {str(e)}")
            return Response({"error": f"Login failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(
    [ratelimit(key='ip', rate=SIGNUP_RATE_LIMIT, method='POST', block=True), csrf_protect],
    name='dispatch'
)
class SendVerificationEmailView(APIView):
    """
    Handles sending verification codes to user email addresses during registration.
    """
    def post(self, request):
        """
        Send a verification code to the provided email address.
        
        Args:
            request: HTTP request object containing email
            
        Returns:
            Response: Success message or error details
        """
        serializer = EmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        if User.objects.filter(email=email).exists():
            ip_address = request.META.get('REMOTE_ADDR', 'unknown') if hasattr(request, 'META') else 'unknown'
            logger.warning(f"Email {email} already exists from IP {ip_address}")
            return Response({"error": "Email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        code = generate_verification_code()
        VerificationCode.objects.update_or_create(email=email, defaults={'code': code})

        try:
            send_mail(
                'Kefi Verification Code',
                f'Your verification code is: {code}',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
            logger.info(f"Verification code sent to {email}")
            return Response({"message": "Verification code sent."}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Failed to send email to {email}: {str(e)}")
            return Response({"error": f"Failed to send email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(
    [ratelimit(key='ip', rate=VERIFICATION_RATE_LIMIT, method='POST', block=True), csrf_protect],
    name='dispatch'
)
class VerifyCodeView(APIView):
    """
    Verifies the email verification code sent to the user.
    """
    def post(self, request):
        """
        Verify the code sent to the user's email.
        
        Args:
            request: HTTP request object containing email and code
            
        Returns:
            Response: Success message or error details
        """
        serializer = VerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']

        try:
            verification = VerificationCode.objects.get(email=email, code=code)
            
            if verification.is_expired():
                verification.delete()
                return Response(
                    {"error": "Verification code has expired. Please request a new one."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Mark the code as verified
            verification.is_verified = True
            verification.save()
            
            logger.info(f"Code verified for {email}")
            return Response({"message": "Code verified successfully."}, status=status.HTTP_200_OK)
        except VerificationCode.DoesNotExist:
            logger.warning(f"Invalid verification code for {email}")
            return Response(
                {"error": "Invalid verification code."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error verifying code for {email}: {str(e)}")
            return Response(
                {"error": "An error occurred while verifying the code."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@method_decorator(
    [ratelimit(key='ip', rate=SIGNUP_RATE_LIMIT, method='POST', block=True), csrf_protect],
    name='dispatch'
)
class CompleteSignupView(APIView):
    """
    Handles the final step of user registration after email verification.
    Creates user account and associated profile.
    """
    def post(self, request):
        """
        Create a new user account and profile with the provided information.
        
        Args:
            request: HTTP request object containing user registration data
            
        Returns:
            Response: User data and JWT tokens on success, error message on failure
        """
        serializer = SignupCompleteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        email = data['email']
        
        # Check if email has been verified
        verification = VerificationCode.objects.filter(email=email, is_verified=True).first()
        if not verification:
            return Response(
                {"error": "Email not verified. Please verify your email first."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                return Response(
                    {"error": "A user with this email already exists."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if User.objects.filter(username=data['username']).exists():
                return Response(
                    {"error": "This username is already taken."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create user and profile
            user = User.objects.create_user(
                email=email,
                username=data['username'],
                password=data['password']
            )
            
            UserProfile.objects.create(
                user=user,
                full_name=data['full_name'],
                birth_date=data['birth_date'],
                gender=data['gender'],
                is_student=data['is_student'],
                profile_completed=False  # Set to False for new users
            )

            # Clean up verification code
            verification.delete()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            ip_address = request.META.get('REMOTE_ADDR', 'unknown') if hasattr(request, 'META') else 'unknown'
            logger.info(f"User {user.username} created successfully from IP {ip_address}")
            
            return Response({
                "message": "User created successfully.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_profile_complete": False  # Set to False for new users
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown') if hasattr(request, 'META') else 'unknown'
            logger.error(f"Signup failed for {email}: {str(e)} from IP {ip_address}")
            return Response(
                {"error": f"Failed to create user: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

@method_decorator(
    [csrf_protect],
    name='dispatch'
)
class ProfileView(APIView):
    """
    Handles user profile operations (retrieval and updates).
    Requires authentication.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve the authenticated user's profile information.
        
        Args:
            request: HTTP request object
            
        Returns:
            Response: User profile data or error message
        """
        profile = UserProfile.objects.filter(user=request.user).first()
        if not profile:
            logger.warning(f"No profile found for user {request.user.username}")
            return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProfileSerializer(profile)
        logger.info(f"Profile retrieved for {request.user.username}")
        return Response({
            **serializer.data,
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'is_profile_complete': profile.is_profile_complete,
            'profile_completed': profile.profile_completed
        }, status=status.HTTP_200_OK)

    def patch(self, request):
        """
        Update the authenticated user's profile information.
        
        Args:
            request: HTTP request object containing profile update data
            
        Returns:
            Response: Updated profile data or error message
        """
        profile = UserProfile.objects.filter(user=request.user).first()
        if not profile:
            logger.warning(f"No profile found for user {request.user.username}")
            return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        logger.info(f"Profile updated for {request.user.username}")
        return Response({
            **serializer.data,
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'is_profile_complete': profile.is_profile_complete,
            'profile_completed': profile.profile_completed
        }, status=status.HTTP_200_OK)

@method_decorator(
    [ratelimit(key='ip', rate=PASSWORD_RESET_RATE_LIMIT, method='POST', block=True), csrf_protect],
    name='dispatch'
)
class PasswordResetView(APIView):
    """
    Handles the initial password reset request by sending a reset code.
    """
    def post(self, request):
        """
        Send a password reset code to the user's email.
        
        Args:
            request: HTTP request object containing email
            
        Returns:
            Response: Success message or error details
        """
        serializer = EmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        user = User.objects.filter(email=email).first()
        if not user:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown') if hasattr(request, 'META') else 'unknown'
            logger.warning(f"Password reset attempt for non-existent email {email} from IP {ip_address}")
            return Response({"error": "Email not found."}, status=status.HTTP_400_BAD_REQUEST)

        code = generate_verification_code()
        VerificationCode.objects.update_or_create(email=email, defaults={'code': code})
        frontend_url = settings.FRONTEND_URL or 'http://localhost:5173'
        reset_url = f"{frontend_url}/reset-password/{code}"

        try:
            send_mail(
                'Kefi Password Reset',
                f'Click the link to reset your password: {reset_url}\nOr use this code: {code}',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
            logger.info(f"Password reset code sent to {email}")
            return Response({"message": "Password reset code sent."}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Failed to send password reset email to {email}: {str(e)}")
            return Response({"error": f"Failed to send email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(
    [ratelimit(key='ip', rate=VERIFICATION_RATE_LIMIT, method='POST', block=True), csrf_protect],
    name='dispatch'
)
class ValidateResetCodeView(APIView):
    """
    Validates the password reset code before allowing password change.
    """
    def post(self, request):
        """
        Validate the provided reset code.
        
        Args:
            request: HTTP request object containing email and reset code
            
        Returns:
            Response: Success message or error details
        """
        serializer = VerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        verification = VerificationCode.objects.filter(email=email, code=code).first()

        if not verification:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown') if hasattr(request, 'META') else 'unknown'
            logger.warning(f"Invalid reset code for {email} from IP {ip_address}")
            return Response({"error": "Invalid reset code."}, status=status.HTTP_400_BAD_REQUEST)

        if verification.is_expired():
            verification.delete()
            ip_address = request.META.get('REMOTE_ADDR', 'unknown') if hasattr(request, 'META') else 'unknown'
            logger.warning(f"Expired reset code for {email} from IP {ip_address}")
            return Response({"error": "Reset code expired."}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"Reset code validated for {email}")
        return Response({"message": "Code valid."}, status=status.HTTP_200_OK)

@method_decorator(
    [ratelimit(key='ip', rate=PASSWORD_RESET_RATE_LIMIT, method='POST', block=True), csrf_protect],
    name='dispatch'
)
class PasswordResetConfirmView(APIView):
    """
    Handles the final step of password reset after code validation.
    """
    def post(self, request):
        """
        Update the user's password with the new password.
        
        Args:
            request: HTTP request object containing email, code, and new password
            
        Returns:
            Response: Success message or error details
        """
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']

        verification = VerificationCode.objects.filter(email=email, code=code).first()
        user = User.objects.filter(email=email).first()

        if not verification or not user:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown') if hasattr(request, 'META') else 'unknown'
            logger.warning(f"Invalid password reset attempt for {email} from IP {ip_address}")
            return Response({"error": "Invalid reset code or email."}, status=status.HTTP_400_BAD_REQUEST)

        if verification.is_expired():
            verification.delete()
            ip_address = request.META.get('REMOTE_ADDR', 'unknown') if hasattr(request, 'META') else 'unknown'
            logger.warning(f"Expired reset code for {email} from IP {ip_address}")
            return Response({"error": "Reset code expired."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        verification.delete()
        RefreshToken.for_user(user).blacklist()
        logger.info(f"Password reset successfully for {email}")
        return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)

@method_decorator(
    [csrf_protect],
    name='dispatch'
)
class LogoutView(APIView):
    """
    Handles user logout by blacklisting the refresh token.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Invalidate the user's refresh token.
        
        Args:
            request: HTTP request object containing refresh token
            
        Returns:
            Response: Success message or error details
        """
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown') if hasattr(request, 'META') else 'unknown'
            logger.warning(f"Logout attempt without refresh token from IP {ip_address}")
            return Response({"error": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            ip_address = request.META.get('REMOTE_ADDR', 'unknown') if hasattr(request, 'META') else 'unknown'
            logger.info(f"Successful logout from IP {ip_address}")
            return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown') if hasattr(request, 'META') else 'unknown'
            logger.error(f"Logout failed from IP {ip_address}: {str(e)}")
            return Response({"error": f"Invalid token: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)