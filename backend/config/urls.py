from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('core.urls.urls_auth')),
    path('api/users/', include('core.urls.urls_users')),
    path('api/boards/', include('boards.urls')),
    path('api/chat/', include('chat.urls')),
]