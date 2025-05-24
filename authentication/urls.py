from django.urls import path
from .views import (
    SendVerificationEmail, VerifyCode, CompleteSignup,
    LoginView, ProfileView, PasswordResetView, PasswordResetConfirmView
)

urlpatterns = [
    path('signup/email/', SendVerificationEmail.as_view(), name='send_verification_email'),
    path('verify/', VerifyCode.as_view(), name='verify_code'),
    path('signup/complete/', CompleteSignup.as_view(), name='complete_signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('password/reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]