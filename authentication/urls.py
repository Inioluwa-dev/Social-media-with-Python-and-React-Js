# authentication/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import (
    CustomTokenObtainPairView,
    LogoutView,
    ProfileView,
    SendVerificationEmailView,
    VerifyCodeView,
    CompleteSignupView,
    PasswordResetView,
    PasswordResetConfirmView,
    ValidateResetCodeView,
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='user_profile'),
    path('signup/email/', SendVerificationEmailView.as_view(), name='send_verification_email'),
    path('verify-code/', VerifyCodeView.as_view(), name='verify_code'),
    path('signup/complete/', CompleteSignupView.as_view(), name='complete_signup'),
    path('password/reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password/reset/validate/', ValidateResetCodeView.as_view(), name='validate_reset_code'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]