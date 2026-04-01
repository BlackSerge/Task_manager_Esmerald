from django.urls import path
from ..views.auth_views import LoginView, RegisterView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("login/", LoginView.as_view(), name='auth_login'), 
    path("register/", RegisterView.as_view(), name="auth_register"),
    path("refresh/", TokenRefreshView.as_view(), name="auth_refresh"),
]