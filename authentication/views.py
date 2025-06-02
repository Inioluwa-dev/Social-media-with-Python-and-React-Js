from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
from django.utils.decorators import method_decorator
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

def generate_verification_code(length=6):
    """Generate a random 6-digit verification code."""
    return ''.join(secrets.choice(string.digits) for _ in range(length))

@method_decorator(
    [axes_dispatch, ratelimit(key='ip', rate='10/m', method='POST', block=True)],
    name='dispatch'
)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        identifier = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')

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
            response_data['user'] = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
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


class SendVerificationEmailView(APIView):
    def post(self, request):
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

class VerifyCodeView(APIView):
    def post(self, request):
        serializer = VerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        verification = VerificationCode.objects.filter(email=email, code=code).first()

        if not verification:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown') if hasattr(request, 'META') else 'unknown'
            logger.warning(f"Invalid verification code for {email} from IP {ip_address}")
            return Response({"error": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)

        if verification.is_expired():
            verification.delete()
            ip_address = request.META.get('REMOTE_ADDR', 'unknown') if hasattr(request, 'META') else 'unknown'
            logger.warning(f"Expired verification code for {email} from IP {ip_address}")
            return Response({"error": "Verification code expired."}, status=status.HTTP_400_BAD_REQUEST)

        verification.delete()
        logger.info(f"Code verified for {email}")
        return Response({"message": "Code verified."}, status=status.HTTP_200_OK)

class CompleteSignupView(APIView):
    def post(self, request):
        serializer = SignupCompleteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        email = data['email']
        try:
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
                is_student=data['is_student']
            )
            VerificationCode.objects.filter(email=email).delete()
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
                    "email": user.email
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            ip_address = request.META.get('REMOTE_ADDR', 'unknown') if hasattr(request, 'META') else 'unknown'
            logger.error(f"Signup failed for {email}: {str(e)} from IP {ip_address}")
            return Response({"error": f"Failed to create user: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
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
            'email': request.user.email
        }, status=status.HTTP_200_OK)

    def patch(self, request):
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
            'email': request.user.email
        }, status=status.HTTP_200_OK)

class PasswordResetView(APIView):
    def post(self, request):
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
        reset_url = f"http://localhost:5173/reset-password/{code}"

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

class ValidateResetCodeView(APIView):
    def post(self, request):
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

class PasswordResetConfirmView(APIView):
    def post(self, request):
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

class LogoutView(APIView):
    def post(self, request):
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