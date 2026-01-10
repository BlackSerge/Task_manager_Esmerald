from django.db import models
from django.conf import settings
from django.db.models import Count, Q

class Board(models.Model):
    """
    Representa el contenedor principal de portafolios/proyectos.
    Gestiona lógica de agregación para el frontend.
    """
    title = models.CharField(max_length=255)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_boards'
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='BoardMember',
        related_name='shared_boards'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-last_activity"]
        verbose_name = "Tablero"

    def __str__(self) -> str:
        return self.title

    # --- Lógica de Negocio Computada (Clean Code) ---

   
    @property
    def completed_cards_count(self) -> int:
        """
        Calcula las tarjetas en la última columna (asumida como 'Done').
        """
        last_column = self.columns.only('id').last()
        if not last_column:
            return 0
        return last_column.cards.count()

    @property
    def last_column(self):
        """Retorna la columna que representa el estado final."""
        return self.columns.only('id').last()

class BoardMember(models.Model):
    """Gestión de permisos (RBAC)."""
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Administrador'
        EDITOR = 'editor', 'Editor'
        VIEWER = 'viewer', 'Observador'

    board = models.ForeignKey(Board, on_delete=models.CASCADE)
    related_name='memberships'
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.VIEWER
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('board', 'user')
        verbose_name = "Miembro del tablero"
        verbose_name_plural = "Miembros del tablero"

    def __str__(self) -> str:
        return f"{self.user.username} - {self.board.title} ({self.role})"


class Column(models.Model):
    """Estados dentro de un tablero."""
    board = models.ForeignKey(
        Board, 
        on_delete=models.CASCADE, 
        related_name="columns"
    )
    title = models.CharField(max_length=255)
    order = models.FloatField(default=0.0)

    class Meta:
        ordering = ["order"]

    def __str__(self) -> str:
        return f"{self.title} ({self.board.title})"


class Card(models.Model):
    """La unidad mínima de trabajo."""
    class Priority(models.TextChoices):
        LOW = 'low', 'Baja'
        MEDIUM = 'medium', 'Media'
        HIGH = 'high', 'Alta'

    column = models.ForeignKey(
        Column, 
        on_delete=models.CASCADE, 
        related_name="cards"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.FloatField(default=0.0)
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order"]

    def __str__(self) -> str:
        return self.title