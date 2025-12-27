from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Board(models.Model):
    title = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="boards")

    def __str__(self):
        return self.title


class Column(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="columns")
    title = models.CharField(max_length=255)
    order = models.FloatField(default=0.0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class Card(models.Model):
    column = models.ForeignKey(Column, on_delete=models.CASCADE, related_name="cards")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.FloatField(default=0.0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title
