from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FolderViewSet, TagViewSet, NoteViewSet, DocumentViewSet

router = DefaultRouter()
router.register('folders', FolderViewSet, basename='folder')
router.register('tags', TagViewSet, basename='tag')
router.register('notes', NoteViewSet, basename='note')
router.register('documents', DocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
]
