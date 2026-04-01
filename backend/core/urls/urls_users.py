from django.urls import path
from ..views.user_views import UserSearchView

urlpatterns = [
    path('search/', UserSearchView.as_view(), name='user-search'),
]