from .models import Board, Column, Card


def get_user_boards(user):
    return Board.objects.filter(owner=user)


def get_user_columns(user):
    return Column.objects.filter(board__owner=user)


def get_user_cards(user):
    return Card.objects.filter(column__board__owner=user)
