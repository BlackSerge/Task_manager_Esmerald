# boards/routing.py
from django.urls import re_path
from .consumers import BoardConsumer

websocket_urlpatterns = [
    # Usamos [^/]+ para que acepte tanto números como UUIDs
    re_path(r"ws/board/(?P<board_id>[^/]+)/$", BoardConsumer.as_asgi()),
]