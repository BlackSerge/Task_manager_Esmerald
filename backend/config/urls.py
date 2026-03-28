from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse 

def api_health_check(request):
    return JsonResponse({"status": "online", "message": "Collaborative Board API Working"})

urlpatterns = [
    path('', api_health_check),
    path('admin/', admin.site.urls),
    path('api/auth/', include('core.urls.urls_auth')),
    path('api/users/', include('core.urls.urls_users')),
    path('api/boards/', include('boards.urls')),
    path('api/chat/', include('chat.urls')),
]