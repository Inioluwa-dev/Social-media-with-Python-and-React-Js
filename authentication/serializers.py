from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile, VerificationCode
import re
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate


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
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Must contain at least one lowercase letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Must contain at least one number.")
        return value

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'username'  # used as identifier field for username/email

    def validate(self, attrs):
        identifier = attrs.get('username')
        password = attrs.get('password')

        if not identifier or not password:
            raise serializers.ValidationError('Must include "username" (username or email) and "password".')

        user_obj = User.objects.filter(email=identifier).first() or User.objects.filter(username=identifier).first()

        if not user_obj:
            raise serializers.ValidationError('No active account found with the given credentials')

        user = authenticate(request=self.context.get('request'), username=user_obj.username, password=password)
        if not user:
            raise serializers.ValidationError('No active account found with the given credentials')

        data = super().validate({'username': user.username, 'password': password})

        # Get the user's profile
        profile = user.profile
        profile_data = ProfileSerializer(profile).data

        # Create user data with profile information
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

