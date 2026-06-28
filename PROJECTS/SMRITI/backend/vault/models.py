import uuid
from django.db import models
from django.utils import timezone
from django.db.models.signals import post_delete
from django.dispatch import receiver
from authentication.models import User
from pgvector.django import VectorField

class Folder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='folders', db_index=True)
    name = models.CharField(max_length=100)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children', db_index=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name', 'parent'], name='unique_folder_name_per_parent_per_user'),
            models.UniqueConstraint(fields=['user', 'name'], condition=models.Q(parent__isnull=True), name='unique_root_folder_name_per_user')
        ]

    def __str__(self):
        return self.name

class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tags', db_index=True)
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'], name='unique_tag_name_per_user')
        ]

    def __str__(self):
        return self.name

class Note(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes', db_index=True)
    folder = models.ForeignKey(Folder, on_delete=models.SET_NULL, null=True, blank=True, related_name='notes', db_index=True)
    title = models.CharField(max_length=200, default='Untitled Note')
    content = models.TextField(default='', blank=True)
    is_archived = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    word_count = models.IntegerField(default=0)
    last_accessed_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    tags = models.ManyToManyField(Tag, related_name='notes', db_table='vault_note_tags', blank=True)

    def save(self, *args, **extra_fields):
        # Calculate word count
        if self.content:
            self.word_count = len(self.content.split())
        else:
            self.word_count = 0
        self.updated_at = timezone.now()
        super().save(*args, **extra_fields)

    def __str__(self):
        return self.title

class Document(models.Model):
    class FileType(models.TextChoices):
        PDF = 'pdf', 'PDF'
        IMAGE = 'image', 'Image'
        AUDIO = 'audio', 'Audio'
        VIDEO = 'video', 'Video'
        TEXT = 'text', 'Text'
        MARKDOWN = 'markdown', 'Markdown'
        DOCX = 'docx', 'Word Document'
        EPUB = 'epub', 'Epub Book'
        CSV = 'csv', 'CSV'
        HTML = 'html', 'HTML Page'
        YOUTUBE = 'youtube', 'YouTube Video'
        NOTION = 'notion', 'Notion Page'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents', db_index=True)
    file_path = models.CharField(max_length=500)
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50, choices=FileType.choices)
    extracted_text = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, default=Status.PENDING, choices=Status.choices, db_index=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.file_name

class Embedding(models.Model):
    class SourceType(models.TextChoices):
        NOTE = 'NOTE', 'Note'
        DOCUMENT = 'DOCUMENT', 'Document'
        URL = 'URL', 'URL'
        AUDIO = 'AUDIO', 'Audio'
        VIDEO = 'VIDEO', 'Video'
        IMAGE = 'IMAGE', 'Image'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_type = models.CharField(max_length=50, choices=SourceType.choices)
    source_id = models.UUIDField()
    chunk_index = models.IntegerField()
    content_chunk = models.TextField()
    vector = VectorField(dimensions=1536)

    class Meta:
        indexes = [
            models.Index(fields=['source_type', 'source_id'], name='vault_emb_source_composite_idx')
        ]

    def __str__(self):
        return f"{self.source_type} {self.source_id} - Chunk {self.chunk_index}"

# Signals for database cascading deletion of associated embeddings
@receiver(post_delete, sender=Note)
def delete_note_embeddings(sender, instance, **kwargs):
    Embedding.objects.filter(source_type=Embedding.SourceType.NOTE, source_id=instance.id).delete()

@receiver(post_delete, sender=Document)
def delete_document_embeddings(sender, instance, **kwargs):
    Embedding.objects.filter(source_type=Embedding.SourceType.DOCUMENT, source_id=instance.id).delete()
