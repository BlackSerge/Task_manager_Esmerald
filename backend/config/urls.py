# backend/config/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('core.urls.urls_auth')),   # Login, Register, Refresh
    path('api/users/', include('core.urls.urls_users')), # Search, Profiles
    path('api/boards/', include('boards.urls')),    # Boards, Columns, Cards
    path('api/chat/', include('chat.urls')),        # Chat messages
]