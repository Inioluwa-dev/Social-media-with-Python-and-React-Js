from django.urls import path
from .views import (
    SendVerificationEmail, VerifyCode, CompleteSignup,
    LoginView, ProfileView, PasswordResetView, PasswordResetConfirmView
)

urlpatterns = [
    path('signup/email/', SendVerificationEmail.as_view()),
    path('verify/', VerifyCode.as_view()),
    path('signup/complete/', CompleteSignup.as_view()),
    path('login/', LoginView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('password/reset/', PasswordResetView.as_view()),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view()),
    # path('api/auth/password/reset/validate/', ValidateResetCodeView.as_view(), name='validate-reset-code'),
]
