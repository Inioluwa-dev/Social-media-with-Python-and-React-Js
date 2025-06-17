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
LOGIN_RATE_LIMIT = '5/m'
SIGNUP_RATE_LIMIT = '10/h'
PASSWORD_RESET_RATE_LIMIT = '3/h'
VERIFICATION_RATE_LIMIT = '10/m'

def generate_verification_code(length=6):
    return ''.join(secrets.choice(string.digits) for _ in range(length))

@method_decorator(
    [axes_dispatch, ratelimit(key='ip', rate=LOGIN_RATE_LIMIT, method='POST', block=True), csrf_protect],
    name='dispatch'
)
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        identifier = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        remember_me = request.data.get('remember_me', False)

        if not identifier or not password:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.warning(f"Missing credentials from IP {ip_address}")
            return Response({
                "errors": {
                    "field_errors": {
                        "username": ["Username or email is required."] if not identifier else [],
                        "password": ["Password is required."] if not password else []
                    },
                    "non_field_errors": ["Please provide both username/email and password."]
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=identifier).first() or User.objects.filter(username=identifier).first()
        if not user:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.warning(f"Non-existent identifier {identifier} from IP {ip_address}")
            return Response({
                "errors": {
                    "field_errors": {"username": ["The email or username does not exist."]},
                    "non_field_errors": ["Invalid credentials."]
                }
            }, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(request=request, username=user.username, password=password)
        if not user:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.warning(f"Failed login for {identifier} from IP {ip_address}")
            return Response({
                "errors": {
                    "field_errors": {"password": ["The password is incorrect."]},
                    "non_field_errors": ["Invalid credentials."]
                }
            }, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data.copy()
        data['username'] = user.username

        try:
            serializer = self.get_serializer(data=data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            response_data = serializer.validated_data

            if remember_me:
                response_data['access'] = str(RefreshToken(response_data['refresh']).access_token)
                response_data['refresh'] = str(RefreshToken.for_user(user))

            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.info(f"Successful login for {user.username} from IP {ip_address}")
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            if 'axes.' in str(e):
                logger.warning(f"Account locked for {identifier} from IP {ip_address}")
                return Response({
                    "errors": {
                        "field_errors": {},
                        "non_field_errors": ["Account locked due to too many failed attempts. Please try again later."]
                    }
                }, status=status.HTTP_403_FORBIDDEN)
            logger.error(f"Login error for {identifier}: {str(e)}")
            return Response({
                "errors": {
                    "field_errors": {},
                    "non_field_errors": ["An unexpected error occurred during login."]
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(
    [ratelimit(key='ip', rate=SIGNUP_RATE_LIMIT, method='POST', block=True), csrf_protect],
    name='dispatch'
)
class SendVerificationEmailView(APIView):
    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "errors": {
                    "field_errors": serializer.errors,
                    "non_field_errors": []
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        if User.objects.filter(email=email).exists():
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.warning(f"Email {email} already exists from IP {ip_address}")
            return Response({
                "errors": {
                    "field_errors": {"email": ["This email is already registered."]},
                    "non_field_errors": []
                }
            }, status=status.HTTP_400_BAD_REQUEST)

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
            return Response({
                "errors": {
                    "field_errors": {},
                    "non_field_errors": ["Failed to send verification email. Please try again."]
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(
    [ratelimit(key='ip', rate=VERIFICATION_RATE_LIMIT, method='POST', block=True), csrf_protect],
    name='dispatch'
)
class VerifyCodeView(APIView):
    def post(self, request):
        serializer = VerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "errors": {
                    "field_errors": serializer.errors,
                    "non_field_errors": []
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']

        try:
            verification = VerificationCode.objects.get(email=email, code=code)
            
            if verification.is_expired():
                verification.delete()
                return Response({
                    "errors": {
                        "field_errors": {"code": ["Verification code has expired."]},
                        "non_field_errors": ["Please request a new verification code."]
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            verification.is_verified = True
            verification.save()
            
            logger.info(f"Code verified for {email}")
            return Response({"message": "Code verified successfully."}, status=status.HTTP_200_OK)
        except VerificationCode.DoesNotExist:
            logger.warning(f"Invalid verification code for {email}")
            return Response({
                "errors": {
                    "field_errors": {"code": ["Invalid verification code."]},
                    "non_field_errors": []
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error verifying code for {email}: {str(e)}")
            return Response({
                "errors": {
                    "field_errors": {},
                    "non_field_errors": ["An error occurred while verifying the code."]
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(
    [ratelimit(key='ip', rate=SIGNUP_RATE_LIMIT, method='POST', block=True), csrf_protect],
    name='dispatch'
)
class CompleteSignupView(APIView):
    def post(self, request):
        serializer = SignupCompleteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "errors": {
                    "field_errors": serializer.errors,
                    "non_field_errors": []
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        email = data['email']
        
        verification = VerificationCode.objects.filter(email=email, is_verified=True).first()
        if not verification:
            return Response({
                "errors": {
                    "field_errors": {"email": ["Email not verified."]},
                    "non_field_errors": ["Please verify your email before completing registration."]
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            if User.objects.filter(email=email).exists():
                return Response({
                    "errors": {
                        "field_errors": {"email": ["A user with this email already exists."]},
                        "non_field_errors": []
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(username=data['username']).exists():
                return Response({
                    "errors": {
                        "field_errors": {"username": ["This username is already taken."]},
                        "non_field_errors": []
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

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
                profile_completed=False
            )

            verification.delete()
            refresh = RefreshToken.for_user(user)
            
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.info(f"User {user.username} created successfully from IP {ip_address}")
            
            return Response({
                "message": "User created successfully.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_profile_complete": False
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.error(f"Signup failed for {email}: {str(e)} from IP {ip_address}")
            return Response({
                "errors": {
                    "field_errors": {},
                    "non_field_errors": ["An error occurred during registration. Please try again."]
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(
    [csrf_protect],
    name='dispatch'
)
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = UserProfile.objects.filter(user=request.user).first()
        if not profile:
            logger.warning(f"No profile found for user {request.user.username}")
            return Response({
                "errors": {
                    "field_errors": {},
                    "non_field_errors": ["Profile not found."]
                }
            }, status=status.HTTP_404_NOT_FOUND)

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
        profile = UserProfile.objects.filter(user=request.user).first()
        if not profile:
            logger.warning(f"No profile found for user {request.user.username}")
            return Response({
                "errors": {
                    "field_errors": {},
                    "non_field_errors": ["Profile not found."]
                }
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({
                "errors": {
                    "field_errors": serializer.errors,
                    "non_field_errors": []
                }
            }, status=status.HTTP_400_BAD_REQUEST)

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
    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "errors": {
                    "field_errors": serializer.errors,
                    "non_field_errors": []
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        user = User.objects.filter(email=email).first()
        if not user:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.warning(f"Password reset attempt for non-existent email {email} from IP {ip_address}")
            return Response({
                "errors": {
                    "field_errors": {"email": ["This email is not registered."]},
                    "non_field_errors": []
                }
            }, status=status.HTTP_400_BAD_REQUEST)

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
            return Response({
                "errors": {
                    "field_errors": {},
                    "non_field_errors": ["Failed to send password reset email. Please try again."]
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(
    [ratelimit(key='ip', rate=VERIFICATION_RATE_LIMIT, method='POST', block=True), csrf_protect],
    name='dispatch'
)
class ValidateResetCodeView(APIView):
    def post(self, request):
        serializer = VerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "errors": {
                    "field_errors": serializer.errors,
                    "non_field_errors": []
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        verification = VerificationCode.objects.filter(email=email, code=code).first()

        if not verification:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.warning(f"Invalid reset code for {email} from IP {ip_address}")
            return Response({
                "errors": {
                    "field_errors": {"code": ["Invalid reset code."]},
                    "non_field_errors": []
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        if verification.is_expired():
            verification.delete()
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.warning(f"Expired reset code for {email} from IP {ip_address}")
            return Response({
                "errors": {
                    "field_errors": {"code": ["Reset code has expired."]},
                    "non_field_errors": ["Please request a new reset code."]
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"Reset code validated for {email}")
        return Response({"message": "Code valid."}, status=status.HTTP_200_OK)

@method_decorator(
    [ratelimit(key='ip', rate=PASSWORD_RESET_RATE_LIMIT, method='POST', block=True), csrf_protect],
    name='dispatch'
)
class PasswordResetConfirmView(APIView):
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "errors": {
                    "field_errors": serializer.errors,
                    "non_field_errors": []
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']

        verification = VerificationCode.objects.filter(email=email, code=code).first()
        user = User.objects.filter(email=email).first()

        if not verification or not user:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.warning(f"Invalid password reset attempt for {email} from IP {ip_address}")
            return Response({
                "errors": {
                    "field_errors": {
                        "code": ["Invalid reset code."] if not verification else [],
                        "email": ["Email not found."] if not user else []
                    },
                    "non_field_errors": ["Invalid reset code or email."]
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        if verification.is_expired():
            verification.delete()
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.warning(f"Expired reset code for {email} from IP {ip_address}")
            return Response({
                "errors": {
                    "field_errors": {"code": ["Reset code has expired."]},
                    "non_field_errors": ["Please request a new reset code."]
                }
            }, status=status.HTTP_400_BAD_REQUEST)

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
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.warning(f"Logout attempt without refresh token from IP {ip_address}")
            return Response({
                "errors": {
                    "field_errors": {"refresh": ["Refresh token is required."]},
                    "non_field_errors": []
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.info(f"Successful logout from IP {ip_address}")
            return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown')
            logger.error(f"Logout failed from IP {ip_address}: {str(e)}")
            return Response({
                "errors": {
                    "field_errors": {"refresh": ["Invalid refresh token."]},
                    "non_field_errors": ["Failed to log out. Please try again."]
                }
            }, status=status.HTTP_400_BAD_REQUEST)