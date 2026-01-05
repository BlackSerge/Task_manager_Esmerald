from django.urls import path
from ..views.user_views import UserSearchView

urlpatterns = [
    # Al estar incluido bajo 'api/users/', esta ruta será: /api/users/search/
    path('search/', UserSearchView.as_view(), name='user-search'),
]