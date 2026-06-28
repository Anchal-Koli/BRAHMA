from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access/edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Enforce that the object user matches request.user
        return hasattr(obj, 'user') and obj.user == request.user
