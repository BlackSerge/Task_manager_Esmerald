
from django.urls import path
from .views import BoardMessagesView

urlpatterns = [
    path('boards/<int:board_id>/messages/', BoardMessagesView.as_view(), name='board-messages'),
]