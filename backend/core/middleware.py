import logging
from urllib.parse import parse_qs
from typing import Dict, Any, Optional

from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

# Configuración del logger profesional
logger = logging.getLogger(__name__)
User = get_user_model()

@database_sync_to_async
def get_user_from_token(token_key: str):
    """
    Lógica de extracción de usuario aislada y segura.
    """
    try:
        token = AccessToken(token_key)
        user_id: Optional[int] = token.get("user_id")
        
        if user_id:
            return User.objects.get(id=user_id)
        return AnonymousUser()
        
    except (InvalidToken, TokenError, User.DoesNotExist):
        return AnonymousUser()

class JWTAuthMiddleware:
    """
    Middleware para autenticación JWT en WebSockets (Channels).
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope: Dict[str, Any], receive, send):
        # 1. Extracción segura de parámetros de consulta
        query_string: str = scope.get("query_string", b"").decode()
        query_params: Dict[str, list[str]] = parse_qs(query_string)
        
        token: Optional[str] = query_params.get("token", [None])[0]

        # 2. Asignación de usuario al scope del protocolo
        if token:
            scope["user"] = await get_user_from_token(token)
        else:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)

def JWTAuthMiddlewareStack(inner):
    """Encapsulador para simplificar la configuración en routing.py"""
    return JWTAuthMiddleware(inner)