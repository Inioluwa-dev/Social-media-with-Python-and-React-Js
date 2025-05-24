from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile, VerificationCode
import re

User = get_user_model()

class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', value):
            raise serializers.ValidationError("Invalid email format.")
        return value

class VerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)

    def validate(self, data):
        try:
            VerificationCode.objects.get(email=data['email'], code=data['code'])
            return data
        except VerificationCode.DoesNotExist:
            raise serializers.ValidationError({"message": "Invalid code."})

class SignupCompleteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=8, write_only=True)
    full_name = serializers.CharField(max_length=255)
    birth_date = serializers.DateField()
    gender = serializers.ChoiceField(choices=['Male', 'Female', 'Other'])
    is_student = serializers.BooleanField()

    def validate_username(self, value):
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError("Username can only contain letters, numbers, and @/./+/-/_.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        return value

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['full_name', 'birth_date', 'gender', 'is_student', 'nickname', 'phone', 'country', 'state', 'is_university']
        read_only_fields = ['full_name', 'birth_date', 'gender', 'is_student']

class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(min_length=8, write_only=True)

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email not found.")
        return value

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        return value

    def validate(self, data):
        try:
            VerificationCode.objects.get(email=data['email'], code=data['code'])
            return data
        except VerificationCode.DoesNotExist:
            raise serializers.ValidationError({"message": "Invalid reset code."})