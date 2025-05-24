from django.db import models

class UserProfile(models.Model):
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255)
    birth_date = models.DateField()
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')])
    is_student = models.BooleanField(default=False)
    nickname = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    is_university = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class VerificationCode(models.Model):
    email = models.EmailField(unique=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Code for {self.email}"