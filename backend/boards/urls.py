from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.board_views import BoardViewSet, ColumnViewSet, CardViewSet
from .views.team_views import BoardTeamView, CardMoveView

router = DefaultRouter(trailing_slash=True)
router.register(r'columns', ColumnViewSet, basename='column')
router.register(r'cards', CardViewSet, basename='card')
router.register(r'', BoardViewSet, basename='board')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:board_id>/members/', BoardTeamView.as_view(), name='board-team-list'),
    path('<int:board_id>/members/invite/', BoardTeamView.as_view(), name='board-team-invite'),
    path('<int:board_id>/members/<int:user_id>/', BoardTeamView.as_view(), name='board-team-remove'),
    path('cards/<int:card_id>/move/', CardMoveView.as_view(), name='card-move'),
]