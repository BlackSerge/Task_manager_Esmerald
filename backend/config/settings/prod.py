from .base import *


DEBUG = False


CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": env("REDIS_URL"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "CONNECTION_POOL_KWARGS": {
                "ssl_cert_reqs": None, 
                "retry_on_timeout": True,
            },
            "SOCKET_CONNECT_TIMEOUT": 10, 
            "SOCKET_TIMEOUT": 10,
        }
    }
}


DATABASES["default"]["OPTIONS"] = {
    "sslmode": "require",
}


STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"


SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"