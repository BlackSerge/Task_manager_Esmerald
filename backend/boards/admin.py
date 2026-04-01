from django.contrib import admin
from .models import Board, BoardMember, Column, Card

admin.site.register(Board)
admin.site.register(BoardMember)
admin.site.register(Column)
admin.site.register(Card)
