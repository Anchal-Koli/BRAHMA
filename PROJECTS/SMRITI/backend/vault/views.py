import os
import uuid
from django.core.files.storage import default_storage
from rest_framework import viewsets, permissions, status, parsers, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Folder, Tag, Note, Document
from .serializers import FolderSerializer, TagSerializer, NoteSerializer, DocumentSerializer
from .permissions import IsOwner

def determine_file_type(filename):
    ext = os.path.splitext(filename)[1].lower()
    if ext == '.pdf':
        return Document.FileType.PDF
    elif ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
        return Document.FileType.IMAGE
    elif ext in ['.mp3', '.wav', '.m4a', '.ogg', '.flac']:
        return Document.FileType.AUDIO
    elif ext in ['.mp4', '.avi', '.mkv', '.mov']:
        return Document.FileType.VIDEO
    elif ext in ['.txt', '.log']:
        return Document.FileType.TEXT
    elif ext in ['.md', '.markdown']:
        return Document.FileType.MARKDOWN
    elif ext in ['.docx', '.doc']:
        return Document.FileType.DOCX
    elif ext in ['.epub']:
        return Document.FileType.EPUB
    elif ext == '.csv':
        return Document.FileType.CSV
    elif ext in ['.html', '.htm']:
        return Document.FileType.HTML
    else:
        return Document.FileType.TEXT

class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwner)

    def get_queryset(self):
        return Folder.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwner)

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwner)

    def get_queryset(self):
        qs = Note.objects.filter(user=self.request.user)
        is_deleted = self.request.query_params.get('is_deleted', 'false').lower() == 'true'
        is_archived = self.request.query_params.get('is_archived', 'false').lower() == 'true'
        return qs.filter(is_deleted=is_deleted, is_archived=is_archived)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        note = self.get_object()
        note.is_archived = True
        note.save()
        return Response({'status': 'Note archived successfully.'})

    @action(detail=True, methods=['post'])
    def unarchive(self, request, pk=None):
        note = self.get_object()
        note.is_archived = False
        note.save()
        return Response({'status': 'Note unarchived successfully.'})

    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        note = self.get_object()
        note.is_deleted = True
        note.save()
        return Response({'status': 'Note soft deleted successfully.'})

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        note = self.get_object()
        note.is_deleted = False
        note.save()
        return Response({'status': 'Note restored successfully.'})

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwner)
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        # Handle custom multipart upload
        file_obj = request.data.get('file')
        if not file_obj:
            return Response({"file": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        # File validation: 20MB limit
        max_size = 20 * 1024 * 1024
        if file_obj.size > max_size:
            return Response({"file": "File size exceeds the 20MB limit."}, status=status.HTTP_400_BAD_REQUEST)

        original_name = file_obj.name
        ext = os.path.splitext(original_name)[1]
        unique_name = f"{uuid.uuid4()}{ext}"

        saved_path = default_storage.save(f"documents/{unique_name}", file_obj)
        file_type = determine_file_type(original_name)

        document = Document.objects.create(
            user=self.request.user,
            file_name=original_name,
            file_path=saved_path,
            file_type=file_type,
            status=Document.Status.PENDING
        )

        serializer = self.get_serializer(document)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
