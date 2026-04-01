import os
import django
from django.core.asgi import get_asgi_application

django.setup()
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from core.middleware import JWTAuthMiddlewareStack
from boards.routing import websocket_urlpatterns as boards_ws
from chat.routing import websocket_urlpatterns as chat_ws

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddlewareStack(
            URLRouter(boards_ws + chat_ws)
        )
    ),
})
