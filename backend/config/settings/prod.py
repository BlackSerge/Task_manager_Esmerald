import ssl
from .base import *

DEBUG = False


SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"


DATABASES["default"]["OPTIONS"] = {
    "sslmode": "require",
}


STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"


CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": env("REDIS_URL"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "IGNORE_EXCEPTIONS": True,  # Previene que un timeout de Redis tumbe el Login (Throttling)
            "CONNECTION_POOL_KWARGS": {
                "ssl_cert_reqs": None,
                "retry_on_timeout": True,
                "health_check_interval": 30,
            },
            "SOCKET_CONNECT_TIMEOUT": 20,
            "SOCKET_TIMEOUT": 20,
        }
    }
}


CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [env("REDIS_URL")],
            "ssl_context": ssl._create_unverified_context(),
        },
    },
}


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "ERROR", # Capturará cualquier Exception o 500 para visibilidad en Render
    },
}