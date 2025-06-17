from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile, VerificationCode
import re
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

User = get_user_model()

class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError(["Email is required."])
        return value

class VerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)

    def validate_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError(["Code must be a 6-digit number."])
        return value

class SignupCompleteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=8, write_only=True)
    full_name = serializers.CharField(max_length=255)
    birth_date = serializers.DateField()
    gender = serializers.ChoiceField(choices=['Male', 'Female', 'Other'])
    is_student = serializers.BooleanField()

    def validate_password(self, value):
        errors = []
        if not re.search(r'[A-Z]', value):
            errors.append("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            errors.append("Password must contain at least one lowercase letter.")
        if not re.search(r'\d', value):
            errors.append("Password must contain at least one number.")
        if len(value) < 8:
            errors.append("Password must be at least 8 characters long.")
        if errors:
            raise serializers.ValidationError(errors)
        return value

    def validate_username(self, value):
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError(["Username can only contain letters, numbers, and underscores."])
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(["This username is already taken."])
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(["This email is already registered."])
        return value

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    is_profile_complete = serializers.BooleanField(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'username', 'email', 'full_name', 'birth_date', 'gender', 'is_student',
            'nickname', 'phone', 'country', 'state', 'is_university', 'is_profile_complete',
            'profile_completed'
        ]
        read_only_fields = ['username', 'email', 'full_name', 'birth_date', 'gender', 'is_student', 'is_profile_complete']

class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(min_length=8, write_only=True)

    def validate_new_password(self, value):
        errors = []
        if not re.search(r'[A-Z]', value):
            errors.append("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            errors.append("Password must contain at least one lowercase letter.")
        if not re.search(r'\d', value):
            errors.append("Password must contain at least one number.")
        if len(value) < 8:
            errors.append("Password must be at least 8 characters long.")
        if errors:
            raise serializers.ValidationError(errors)
        return value

    def validate_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError(["Code must be a 6-digit number."])
        return value

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'username'

    def validate(self, attrs):
        identifier = attrs.get('username')
        password = attrs.get('password')

        if not identifier or not password:
            raise serializers.ValidationError({
                "username": ["Username or email is required."] if not identifier else [],
                "password": ["Password is required."] if not password else [],
            })

        user_obj = User.objects.filter(email=identifier).first() or User.objects.filter(username=identifier).first()

        if not user_obj:
            raise serializers.ValidationError({
                "username": ["No active account found with the given email or username."],
            })

        user = authenticate(request=self.context.get('request'), username=user_obj.username, password=password)
        if not user:
            raise serializers.ValidationError({
                "password": ["The password is incorrect."],
            })

        data = super().validate({'username': user.username, 'password': password})

        profile = user.profile
        profile_data = ProfileSerializer(profile).data

        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_profile_complete': profile.is_profile_complete,
            'profile_completed': profile.profile_completed,
            'full_name': profile.full_name,
            'birth_date': profile.birth_date,
            'gender': profile.gender,
            'is_student': profile.is_student,
            'nickname': profile.nickname,
            'phone': profile.phone,
            'country': profile.country,
            'state': profile.state,
            'is_university': profile.is_university
        }

        data['user'] = user_data
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        return token