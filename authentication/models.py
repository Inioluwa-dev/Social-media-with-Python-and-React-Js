from django.db import models
from django.utils import timezone
from datetime import timedelta

class UserProfile(models.Model):
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='profile', unique=True)
    full_name = models.CharField(max_length=255)
    birth_date = models.DateField()
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')])
    is_student = models.BooleanField(default=False)
    nickname = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    is_university = models.BooleanField(default=False)
    profile_completed = models.BooleanField(default=False)

    @property
    def is_profile_complete(self):
        """
        Check if the profile is complete by verifying if the user has gone through the profile completion step.
        Optional fields can be empty.
        """
        return self.profile_completed

    def __str__(self):
        return f"{self.user.username}'s Profile"

    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]

class VerificationCode(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def is_expired(self):
        expiration_time = timedelta(minutes=30)
        return timezone.now() > self.created_at + expiration_time

    def __str__(self):
        return f"{self.email} - {self.code}"

    class Meta:
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['created_at']),
        ]