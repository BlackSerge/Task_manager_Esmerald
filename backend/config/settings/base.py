import os
import dj_database_url
from pathlib import Path
import environ
from datetime import timedelta

# -----------------------------
# Base directory and env
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env = environ.Env(DEBUG=(bool, False))

# Carga el .env si existe (útil para desarrollo local)
if os.path.exists(BASE_DIR / ".env"):
    environ.Env.read_env(BASE_DIR / ".env")

# -----------------------------
# Basic Config
# -----------------------------
SECRET_KEY = env("SECRET_KEY", default="django-insecure-placeholder")
DEBUG = env.bool("DEBUG", default=False) # Por defecto False por seguridad
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=[])

# -----------------------------
# Installed apps
# -----------------------------
INSTALLED_APPS = [
    "daphne",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "channels",
    "corsheaders",
    
    # Local apps
    "boards.apps.BoardsConfig", # Es mejor usar la ruta completa a la AppConfig
    "chat.apps.ChatConfig",
    "core.apps.CoreConfig",
]

# -----------------------------
# Middleware
# -----------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware", # Crítico para estáticos
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# -----------------------------
# URLs and ASGI
# -----------------------------
ROOT_URLCONF = "config.urls"
ASGI_APPLICATION = "config.asgi.application"



# -----------------------------
# Templates 
# -----------------------------


TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]



# -----------------------------
# Database (Lógica dj-database-url)
# -----------------------------
DB_URL = env("DATABASE_URL", default=f"postgres://{env('DB_USER', default='')}:{env('DB_PASSWORD', default='')}@{env('DB_HOST', default='db')}:{env('DB_PORT', default='5432')}/{env('DB_NAME', default='')}")

DATABASES = {
    'default': dj_database_url.config(
        default=DB_URL,
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# -----------------------------
# Channels (Redis)
# -----------------------------
REDIS_URL = env("REDIS_URL", default=f"redis://{env('REDIS_HOST', default='redis')}:{env('REDIS_PORT', default='6379')}/1")

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [REDIS_URL],
            "symmetric_encryption_keys": [SECRET_KEY[:32]] if not DEBUG else None,
        },
    }
}

# -----------------------------
# Static & Media
# -----------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# -----------------------------
# CORS & Auth
# -----------------------------
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=["http://localhost:5173"])

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    )
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# (Logs y Validators se mantienen igual al final del archivo)
# -----------------------------
# Logging
# -----------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}

# Validators

AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator' },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8} },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator' },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator' },
    # --- VALIDACIÓN ROBUSTA PROFESIONAL ---
    {
        'NAME': 'core.validators.ComplexityPasswordValidator', # Ajusta la ruta según tu estructura
    },
]