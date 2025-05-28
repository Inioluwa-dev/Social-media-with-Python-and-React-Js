from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile, VerificationCode
from .serializers import (
    EmailSerializer, VerificationSerializer, SignupCompleteSerializer,
    LoginSerializer, ProfileSerializer, PasswordResetConfirmSerializer
)
import secrets
import string

User = get_user_model()

def generate_verification_code(length=6):
    return ''.join(secrets.choice(string.digits) for _ in range(length))


class SendVerificationEmail(APIView):
    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            if User.objects.filter(email=email).exists():
                return Response({"email": ["Email already exists."]}, status=status.HTTP_400_BAD_REQUEST)

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
                return Response({"message": "Verification code sent."}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"email": [str(e)]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyCode(APIView):
    def post(self, request):
        serializer = VerificationSerializer(data=request.data)
        if serializer.is_valid():
            verification = VerificationCode.objects.filter(
                email=serializer.validated_data['email'],
                code=serializer.validated_data['code']
            ).first()
            if verification:
                verification.delete()
                return Response({"message": "Code verified."}, status=status.HTTP_200_OK)
            return Response({"message": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CompleteSignup(APIView):
    def post(self, request):
        serializer = SignupCompleteSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            user = User.objects.create_user(
                email=data['email'],
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
            user = User.objects.filter(username=username).first()
            if user and user.check_password(password):
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }, status=status.HTTP_200_OK)

            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = UserProfile.objects.filter(user=request.user).first()
        if profile:
            serializer = ProfileSerializer(profile)
            return Response(serializer.data)
        return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        profile = UserProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetView(APIView):
    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email=email).first()
            if not user:
                return Response({"email": ["Email not found."]}, status=status.HTTP_400_BAD_REQUEST)

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
                return Response({"message": "Password reset code sent."}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"email": [str(e)]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


# class ValidateResetCodeView(APIView):
#     def post(self, request):
#         email = request.data.get('email')
#         code = request.data.get('code')

#         if not email or not code:
#             return Response({"detail": "Email and code are required."}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             user = User.objects.get(email=email)
#         except User.DoesNotExist:
#             return Response({"detail": "Invalid email or code."}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             reset_entry = VerificationCode.objects.get(user=user, code=code)
#         except VerificationCode.DoesNotExist:
#             return Response({"detail": "Invalid reset code."}, status=status.HTTP_400_BAD_REQUEST)

#         # Assuming you have expiration logic in your model
#         if reset_entry.is_expired():  # implement this method or field yourself
#             return Response({"detail": "Reset code expired."}, status=status.HTTP_400_BAD_REQUEST)

#         return Response({"detail": "Code valid."}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            new_password = serializer.validated_data['new_password']

            verification = VerificationCode.objects.filter(email=email, code=code).first()
            user = User.objects.filter(email=email).first()

            if not verification or not user:
                return Response({"message": "Invalid reset code or email."}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            verification.delete()
            return Response({"message": "Password reset successfully."})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
