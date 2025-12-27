# backend/config/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # 1. Rutas de Autenticación (Login, Registro, Refresh)
    path('api/auth/', include('core.urls')), 
    # 2. Rutas de la API de Tableros (CRUD)
    path('api/', include('boards.urls')), 
]