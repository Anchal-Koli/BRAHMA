import bleach
from rest_framework import serializers
from .models import Folder, Tag, Note, Document

def sanitize_html(text):
    if not text:
        return ""
    allowed_tags = [
        'p', 'b', 'i', 'u', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'br', 'span', 'pre', 'code', 'blockquote', 'img'
    ]
    allowed_attrs = {
        'a': ['href', 'title', 'target'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        '*': ['class', 'style']
    }
    return bleach.clean(text, tags=allowed_tags, attributes=allowed_attrs, strip=True)

class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ('id', 'name', 'parent', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_parent(self, value):
        user = self.context['request'].user
        if value and value.user != user:
            raise serializers.ValidationError("Parent folder must belong to you.")
        return value

    def validate(self, data):
        user = self.context['request'].user
        name = data.get('name')
        parent = data.get('parent', None)
        
        # Determine if we are updating an existing folder
        instance_id = self.instance.id if self.instance else None
        
        # Check uniqueness constraints manually
        queryset = Folder.objects.filter(user=user, name=name)
        if parent:
            queryset = queryset.filter(parent=parent)
        else:
            queryset = queryset.filter(parent__isnull=True)
            
        if instance_id:
            queryset = queryset.exclude(id=instance_id)
            
        if queryset.exists():
            raise serializers.ValidationError(f"A folder with the name '{name}' already exists in this location.")
            
        return data

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate(self, data):
        user = self.context['request'].user
        name = data.get('name')
        instance_id = self.instance.id if self.instance else None
        
        queryset = Tag.objects.filter(user=user, name=name)
        if instance_id:
            queryset = queryset.exclude(id=instance_id)
            
        if queryset.exists():
            raise serializers.ValidationError(f"A tag named '{name}' already exists.")
            
        return data

class NoteSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(many=True, queryset=Tag.objects.all(), required=False)

    class Meta:
        model = Note
        fields = (
            'id', 'folder', 'title', 'content', 'is_archived', 'is_deleted',
            'word_count', 'last_accessed_at', 'created_at', 'updated_at', 'tags'
        )
        read_only_fields = ('id', 'word_count', 'last_accessed_at', 'created_at', 'updated_at')

    def validate_folder(self, value):
        user = self.context['request'].user
        if value and value.user != user:
            raise serializers.ValidationError("Folder must belong to you.")
        return value

    def validate_tags(self, value):
        user = self.context['request'].user
        for tag in value:
            if tag.user != user:
                raise serializers.ValidationError("Assigned tags must belong to you.")
        return value

    def validate_content(self, value):
        return sanitize_html(value)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['tags'] = TagSerializer(instance.tags.all(), many=True).data
        return rep

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ('id', 'file_name', 'file_path', 'file_type', 'status', 'created_at')
        read_only_fields = ('id', 'created_at')
