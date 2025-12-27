import os
import django # 👈 Añadimos esto para asegurar la carga
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
# 1. Inicializar la aplicación ASGI de Django primero
django_asgi_app = get_asgi_application()
django.setup() # 👈 Asegura que los modelos estén listos

# 2. AHORA importamos lo que depende de los modelos
from channels.routing import ProtocolTypeRouter, URLRouter
from core.middleware.jwt_auth import JWTAuthMiddlewareStack
from boards.routing import websocket_urlpatterns as boards_ws
from chat.routing import websocket_urlpatterns as chat_ws

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddlewareStack(
        URLRouter(
            boards_ws + chat_ws
        )
    ),
})