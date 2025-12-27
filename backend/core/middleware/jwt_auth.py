from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from urllib.parse import parse_qs

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token_key):
    try:
        token = AccessToken(token_key)
        user_id = token.get("user_id")
        if user_id:
            user = User.objects.get(id=user_id)
            return user
        return AnonymousUser()
    except (InvalidToken, TokenError, User.DoesNotExist) as e:
        print(f"⚠️ [JWT Middleware]: Token inválido o usuario no existe: {str(e)}")
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # 1. Extraer la query string de forma robusta
        query_string = scope.get("query_string", b"").decode()
        # parse_qs maneja correctamente los caracteres especiales de la URL
        query_params = parse_qs(query_string)
        
        token = query_params.get("token", [None])[0]

        # 2. Inyectar usuario en el scope
        if token:
            scope["user"] = await get_user_from_token(token)
            if scope["user"].is_anonymous:
                print("🚫 [JWT Middleware]: Usuario anónimo tras validar token.")
            else:
                print(f"👤 [JWT Middleware]: Usuario autenticado: {scope['user'].username}")
        else:
            print("❗ [JWT Middleware]: No se proporcionó token en la URL.")
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)

def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)