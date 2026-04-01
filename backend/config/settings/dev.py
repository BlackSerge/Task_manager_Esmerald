from .base import *

DEBUG = True


ALLOWED_HOSTS = ['*']


CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://192.168.231.8:8000",
    "http://localhost:5173",
    "https://*.trycloudflare.com",
]


CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.231.8:5173",
    "https://general-mathematical-thumb-seekers.trycloudflare.com",
]