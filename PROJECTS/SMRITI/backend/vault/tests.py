import tempfile
from django.urls import reverse
from django.test import TestCase
from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.test import APITestCase
from authentication.models import User
from .models import Folder, Tag, Note, Document, Embedding

class SmritiTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='testuser@example.com', password='testpassword')

    def test_custom_user_creation(self):
        self.assertEqual(self.user.email, 'testuser@example.com')
        self.assertTrue(self.user.check_password('testpassword'))

    def test_folder_uniqueness_constraints(self):
        folder1 = Folder.objects.create(user=self.user, name='RootFolder')
        self.assertEqual(folder1.name, 'RootFolder')

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Folder.objects.create(user=self.user, name='RootFolder')

        child1 = Folder.objects.create(user=self.user, name='ChildFolder', parent=folder1)
        self.assertEqual(child1.parent, folder1)

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Folder.objects.create(user=self.user, name='ChildFolder', parent=folder1)

    def test_tag_uniqueness_constraint(self):
        Tag.objects.create(user=self.user, name='Tag1')
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Tag.objects.create(user=self.user, name='Tag1')

    def test_note_signals_delete_embeddings(self):
        note = Note.objects.create(user=self.user, title='Test Note', content='Test Content')
        embedding = Embedding.objects.create(
            source_type=Embedding.SourceType.NOTE,
            source_id=note.id,
            chunk_index=0,
            content_chunk='Test Content chunk',
            vector=[0.1] * 1536
        )

        self.assertEqual(Embedding.objects.count(), 1)
        note.delete()
        self.assertEqual(Embedding.objects.count(), 0)

    def test_document_signals_delete_embeddings(self):
        doc = Document.objects.create(
            user=self.user,
            file_path='/path/to/file.pdf',
            file_name='file.pdf',
            file_type=Document.FileType.PDF,
            status=Document.Status.COMPLETED
        )
        embedding = Embedding.objects.create(
            source_type=Embedding.SourceType.DOCUMENT,
            source_id=doc.id,
            chunk_index=0,
            content_chunk='PDF chunk content',
            vector=[0.2] * 1536
        )

        self.assertEqual(Embedding.objects.count(), 1)
        doc.delete()
        self.assertEqual(Embedding.objects.count(), 0)


class SmritiAPITestCase(APITestCase):
    def setUp(self):
        # Create users
        self.user = User.objects.create_user(email='user1@example.com', username='user1', password='password123')
        self.other_user = User.objects.create_user(email='user2@example.com', username='user2', password='password123')
        
        # Get tokens
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'email': 'user1@example.com', 'password': 'password123'}, format='json')
        self.token = response.data['access']
        
        # Authenticate client
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

    def test_health_check_endpoint(self):
        url = reverse('health_check')
        # Health check is public
        self.client.credentials()  # Clear credentials
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['status'], 'healthy')

    def test_user_registration(self):
        url = reverse('auth_register')
        self.client.credentials()  # Clear credentials
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': 'strongpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], 'newuser@example.com')

    def test_user_registration_weak_password(self):
        url = reverse('auth_register')
        self.client.credentials()  # Clear credentials
        # Test short password
        data = {
            'email': 'weak@example.com',
            'username': 'weakuser',
            'password': '123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

        # Test entirely numeric password
        data['password'] = '12345678'
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_user_logout_and_blacklist(self):
        # Obtain tokens first
        login_url = reverse('token_obtain_pair')
        login_response = self.client.post(login_url, {'email': 'user1@example.com', 'password': 'password123'}, format='json')
        access = login_response.data['access']
        refresh = login_response.data['refresh']

        # Log out
        logout_url = reverse('auth_logout')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access)
        response = self.client.post(logout_url, {'refresh': refresh}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Try to use blacklisted refresh token to obtain a new access token
        refresh_url = reverse('token_refresh')
        response = self.client.post(refresh_url, {'refresh': refresh}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_profile_authenticated(self):
        url = reverse('auth_profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'user1@example.com')

    def test_folder_crud_and_tenant_isolation(self):
        # Create folder
        url = reverse('folder-list')
        response = self.client.post(url, {'name': 'FolderA'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        folder_id = response.data['id']

        # Verify folder lists in query
        response = self.client.get(url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'FolderA')

        # Other user should not see this folder
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.get_user2_token())
        response = self.client.get(url)
        self.assertEqual(len(response.data), 0)

        # Other user cannot access folder detail
        detail_url = reverse('folder-detail', args=[folder_id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_tag_crud_and_uniqueness(self):
        url = reverse('tag-list')
        # Create tag
        response = self.client.post(url, {'name': 'Project'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Try duplicate tag
        response = self.client.post(url, {'name': 'Project'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_note_crud_and_xss_sanitization(self):
        # Create tag for note
        tag = Tag.objects.create(user=self.user, name='Personal')

        # Create note with malicious HTML payload
        url = reverse('note-list')
        payload = {
            'title': 'Hack Note',
            'content': '<p>Safe Text</p><script>alert("XSS")</script><img src="x" onerror="steal()"/>',
            'tags': [tag.id]
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify note text is sanitized (bleached)
        note_id = response.data['id']
        sanitized_content = response.data['content']
        self.assertNotIn('<script>', sanitized_content)
        self.assertNotIn('onerror', sanitized_content)
        self.assertIn('<p>Safe Text</p>', sanitized_content)

        # Test archive action
        archive_url = reverse('note-archive', args=[note_id])
        response = self.client.post(archive_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify it's archived
        note = Note.objects.get(id=note_id)
        self.assertTrue(note.is_archived)

    def test_document_metadata_upload_limits(self):
        url = reverse('document-list')
        
        # Create a small mock file
        with tempfile.NamedTemporaryFile(suffix='.pdf') as temp_file:
            temp_file.write(b"Mock PDF Content")
            temp_file.seek(0)
            
            response = self.client.post(url, {'file': temp_file}, format='multipart')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(response.data['file_type'], 'pdf')
            self.assertEqual(response.data['status'], 'PENDING')

        # Test 20MB file upload limit
        large_file = tempfile.NamedTemporaryFile(suffix='.pdf')
        large_file.seek(21 * 1024 * 1024)  # 21MB
        large_file.write(b"0")
        large_file.seek(0)

        response = self.client.post(url, {'file': large_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("exceeds the 20MB limit", response.data['file'])

    def get_user2_token(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'email': 'user2@example.com', 'password': 'password123'}, format='json')
        return response.data['access']
