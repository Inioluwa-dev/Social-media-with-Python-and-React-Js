from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import UserProfile, VerificationCode
from .serializers import (
    EmailSerializer, VerificationSerializer, SignupCompleteSerializer,
    LoginSerializer, ProfileSerializer, PasswordResetConfirmSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
import secrets
import string

User = get_user_model()

class SendVerificationEmail(APIView):
    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            if User.objects.filter(email=email).exists():
                return Response({"email": ["Email already exists."]}, status=status.HTTP_400_BAD_REQUEST)
            
            code = ''.join(secrets.choice(string.digits) for _ in range(6))
            VerificationCode.objects.update_or_create(
                email=email,
                defaults={'code': code}
            )
            
            try:
                send_mail(
                    'Kefi Verification Code',
                    f'Your verification code is: {code}',
                    settings.EMAIL_HOST_USER,
                    [email],
                    fail_silently=False,
                )
                return Response({"message": "Verification code sent."}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"email": [str(e)]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyCode(APIView):
    def post(self, request):
        serializer = VerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            try:
                verification = VerificationCode.objects.get(email=email, code=code)
                verification.delete()
                return Response({"message": "Code verified."}, status=status.HTTP_200_OK)
            except VerificationCode.DoesNotExist:
                return Response({"message": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CompleteSignup(APIView):
    def post(self, request):
        serializer = SignupCompleteSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            username = serializer.validated_data['username']
            
            if User.objects.filter(email=email).exists() or User.objects.filter(username=username).exists():
                return Response({"message": "Email or username already exists."}, status=status.HTTP_400_BAD_REQUEST)
            
            user = User.objects.create_user(
                email=email,
                username=username,
                password=serializer.validated_data['password']
            )
            
            UserProfile.objects.create(
                user=user,
                full_name=serializer.validated_data['full_name'],
                birth_date=serializer.validated_data['birth_date'],
                gender=serializer.validated_data['gender'],
                is_student=serializer.validated_data['is_student']
            )
            
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "User created successfully.",
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            try:
                user = User.objects.get(username=username)
                if user.check_password(password):
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        'access': str(refresh.access_token),
                        'refresh': str(refresh)
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
            except User.DoesNotExist:
                return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = ProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = ProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except UserProfile.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

class PasswordResetView(APIView):
    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                code = ''.join(secrets.choice(string.digits) for _ in range(6))
                VerificationCode.objects.update_or_create(
                    email=email,
                    defaults={'code': code}
                )
                reset_url = f"http://localhost:5173/reset-password/{code}"
                send_mail(
                    'Kefi Password Reset',
                    f'Click the link to reset your password: {reset_url}\nOr use this code: {code}',
                    settings.EMAIL_HOST_USER,
                    [email],
                    fail_silently=False,
                )
                return Response({"message": "Password reset code sent."}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({"email": ["Email not found."]}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"email": [str(e)]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            new_password = serializer.validated_data['new_password']
            try:
                verification = VerificationCode.objects.get(email=email, code=code)
                user = User.objects.get(email=email)
                user.set_password(new_password)
                user.save()
                verification.delete()
                return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)
            except VerificationCode.DoesNotExist:
                return Response({"message": "Invalid reset code."}, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                return Response({"email": ["Email not found."]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)