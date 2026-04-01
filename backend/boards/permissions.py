from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """Grants access only if the requesting user is the object's owner."""

    def has_object_permission(self, request, view, obj):
        return getattr(obj, "owner", None) == request.user
