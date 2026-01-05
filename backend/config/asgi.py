# asgi.py
import os
import django
from django.core.asgi import get_asgi_application

# 1. Configurar el entorno de Django antes de cualquier otra cosa
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

# 2. Inicializar Django. Esto debe ir ANTES de importar los ruteos de tus apps
# para evitar errores de "Apps aren't loaded yet".
django.setup()
django_asgi_app = get_asgi_application()

# 3. AHORA importamos ruteos y middleware (Después de django.setup)
from channels.routing import ProtocolTypeRouter, URLRouter
from core.middleware import JWTAuthMiddlewareStack
from boards.routing import websocket_urlpatterns as boards_ws
from chat.routing import websocket_urlpatterns as chat_ws

# Unificamos las rutas de WebSocket
all_websocket_urlpatterns = boards_ws + chat_ws

application = ProtocolTypeRouter({
    # Maneja peticiones HTTP normales
    "http": django_asgi_app,
    
    # Maneja WebSockets con tu Middleware de JWT personalizado
    "websocket": JWTAuthMiddlewareStack(
        URLRouter(
            all_websocket_urlpatterns
        )
    ),
})