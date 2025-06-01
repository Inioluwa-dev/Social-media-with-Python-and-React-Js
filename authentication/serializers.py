from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile, VerificationCode
import re
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)

class SignupCompleteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=8, write_only=True)
    full_name = serializers.CharField(max_length=255)
    birth_date = serializers.DateField()
    gender = serializers.ChoiceField(choices=['Male', 'Female', 'Other'])
    is_student = serializers.BooleanField()

    def validate_password(self, value):
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Must contain at least one lowercase letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Must contain at least one number.")
        return value

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'full_name', 'birth_date', 'gender', 'is_student',
            'nickname', 'phone', 'country', 'state', 'is_university'
        ]
        read_only_fields = ['full_name', 'birth_date', 'gender', 'is_student']

class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(min_length=8, write_only=True)

    def validate_new_password(self, value):
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Must contain at least one lowercase letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Must contain at least one number.")
        return value

# class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
#     @classmethod
#     def get_token(cls, user):
#         token = super().get_token(user)
#         # Add custom claims
#         token['username'] = user.username
#         token['email'] = user.email
#         return token
