# boards/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.board_views import BoardViewSet, ColumnViewSet, CardViewSet
from .views.team_views import BoardTeamView, CardMoveView

# boards/urls.py

router = DefaultRouter(trailing_slash=True)

# ✅ Cambiamos r'' por r'list' o simplemente r'boards' 
# Pero para que coincida con tu api/boards/, lo mejor es:
router.register(r'columns', ColumnViewSet, basename='column')
router.register(r'cards', CardViewSet, basename='card')
router.register(r'', BoardViewSet, basename='board') # Déjalo al final


urlpatterns = [
    path('', include(router.urls)),

    # Ruta para listar y para invitar (POST)
    path('<int:board_id>/members/', BoardTeamView.as_view(), name='board-team-list'),
    
    # Añadimos esta para que coincida con tu frontend
    path('<int:board_id>/members/invite/', BoardTeamView.as_view(), name='board-team-invite'),

    path('<int:board_id>/members/<int:user_id>/', BoardTeamView.as_view(), name='board-team-remove'),
    path('cards/<int:card_id>/move/', CardMoveView.as_view(), name='card-move'),
]