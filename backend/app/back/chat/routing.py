# chat/routing.py
from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r"api/ws/chat/(?P<room_name>[0-9a-f-]+)/$", consumers.ChatConsumer.as_asgi()),
]

