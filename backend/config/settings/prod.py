from .base import *

# Forzamos DEBUG a False por si acaso
DEBUG = False

# Railway/Render inyectan ALLOWED_HOSTS
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")

# --- Almacenamiento en la Nube ---
INSTALLED_APPS += ["cloudinary_storage", "cloudinary"]

# Cloudinary para archivos subidos por usuarios
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"

# WhiteNoise para archivos CSS/JS (Compresión y Cache)
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

#DB en producción usa SSL
DATABASES['default']['OPTIONS'] = {
    'sslmode': 'require',
}

# --- Seguridad Estricta ---
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# CORS en producción debe ser restrictivo
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS")