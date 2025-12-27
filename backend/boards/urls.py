from rest_framework.routers import DefaultRouter
from .views import BoardViewSet, ColumnViewSet, CardViewSet

router = DefaultRouter()
router.register(r"boards", BoardViewSet, basename="boards")
router.register(r"columns", ColumnViewSet, basename="columns")
router.register(r"cards", CardViewSet, basename="cards")

urlpatterns = router.urls
