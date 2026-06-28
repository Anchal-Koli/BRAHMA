from django.contrib import admin
from .models import Folder, Tag, Note, Document, Embedding

@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'parent', 'created_at')
    list_filter = ('user', 'created_at')
    search_fields = ('name',)

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    list_filter = ('user', 'created_at')
    search_fields = ('name',)

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'folder', 'word_count', 'is_archived', 'is_deleted', 'updated_at')
    list_filter = ('user', 'is_archived', 'is_deleted', 'created_at')
    search_fields = ('title', 'content')

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'user', 'file_type', 'status', 'created_at')
    list_filter = ('user', 'file_type', 'status', 'created_at')
    search_fields = ('file_name',)

@admin.register(Embedding)
class EmbeddingAdmin(admin.ModelAdmin):
    list_display = ('source_type', 'source_id', 'chunk_index')
    list_filter = ('source_type',)
