from .base import *
import environ

env = environ.Env()
DEBUG = False
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["*"])

# --- Cloudinary ---
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
STATIC_URL = env("STATIC_URL")
MEDIA_URL = env("MEDIA_URL")


STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = (
    "whitenoise.storage.CompressedManifestStaticFilesStorage"
)
# --- Security Settings ---

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
