# KnowledgeOS: Phase 2 - Database Schema Design (V2 - Future-Proofed)

This document details the refactored, production-ready database schema design for **KnowledgeOS**. Following critical feedback on V1, this version introduces generic vector source mappings, extensible enums for file classifications, and analytical note tracking.

---

## 1. Relational Schema & Table Specifications

### 1.1 App: `authentication`

#### Table: `authentication_user` (Custom User Model)
*   **Purpose:** Secure, custom user entity using email as the unique login identifier.
*   **Columns:**
    *   `id` (UUID, Primary Key, Default: `uuid_generate_v4()`)
    *   `email` (Varchar(255), Unique, Indexed)
    *   `username` (Varchar(150), Nullable)
    *   `password` (Varchar(128)) - Stores PBKDF2/Argon2 hashes.
    *   `is_active` (Boolean, Default: `True`)
    *   `is_staff` (Boolean, Default: `False`)
    *   `date_joined` (Timestamp, Default: `timezone.now`)

---

### 1.2 App: `vault`

#### Table: `vault_folder`
*   **Purpose:** Hierarchical folder tree for notes organization.
*   **Columns:**
    *   `id` (UUID, Primary Key, Default: `uuid_generate_v4()`)
    *   `user_id` (UUID, Foreign Key -> `authentication_user.id`, `on_delete=CASCADE`, Indexed)
    *   `name` (Varchar(100))
    *   `parent_id` (UUID, Foreign Key -> `vault_folder.id`, `on_delete=CASCADE`, Nullable, Indexed)
    *   `created_at` (Timestamp, Default: `timezone.now`)
*   **Constraints:**
    *   `UniqueConstraint(fields=['user', 'name', 'parent'])` - Enforces unique folder names within the same parent folder per user. A separate unique constraint check is executed when parent is null.

#### Table: `vault_note`
*   **Purpose:** Stores rich-text personal notes.
*   **Columns:**
    *   `id` (UUID, Primary Key, Default: `uuid_generate_v4()`)
    *   `user_id` (UUID, Foreign Key -> `authentication_user.id`, `on_delete=CASCADE`, Indexed)
    *   `folder_id` (UUID, Foreign Key -> `vault_folder.id`, `on_delete=SET_NULL`, Nullable, Indexed)
    *   `title` (Varchar(200), Default: `"Untitled Note"`)
    *   `content` (TextField, Default: `""`)
    *   `is_archived` (Boolean, Default: `False`)
    *   `is_deleted` (Boolean, Default: `False`)
    *   `word_count` (Integer, Default: `0`)
    *   `last_accessed_at` (Timestamp, Default: `timezone.now`)
    *   `created_at` (Timestamp, Default: `timezone.now`)
    *   `updated_at` (Timestamp, Default: `timezone.now`)
*   **Indexes:**
    *   PostgreSQL Full-Text Search (FTS) index (`gin` index on `to_tsvector('english', title || ' ' || content)`).

#### Table: `vault_tag`
*   **Purpose:** Custom tag taxonomy. Many-to-many relationship with notes.
*   **Columns:**
    *   `id` (UUID, Primary Key, Default: `uuid_generate_v4()`)
    *   `user_id` (UUID, Foreign Key -> `authentication_user.id`, `on_delete=CASCADE`, Indexed)
    *   `name` (Varchar(50))
    *   `created_at` (Timestamp, Default: `timezone.now`)
*   **Constraints:**
    *   `UniqueConstraint(fields=['user', 'name'])` - Prevents duplicate tags for the same user.

#### Table: `vault_note_tags` (M2M Join Table)
*   **Purpose:** Maps notes to tags.
*   **Columns:**
    *   `id` (BigIntegerField, Primary Key, Auto-increment)
    *   `note_id` (UUID, Foreign Key -> `vault_note.id`, `on_delete=CASCADE`, Indexed)
    *   `tag_id` (UUID, Foreign Key -> `vault_tag.id`, `on_delete=CASCADE`, Indexed)
*   **Constraints:**
    *   `UniqueConstraint(fields=['note', 'tag'])` - Prevents linking the same tag to a note multiple times.

#### Table: `vault_document`
*   **Purpose:** Tracks uploaded files (PDFs, Images, Audio) and their parsing states.
*   **Columns:**
    *   `id` (UUID, Primary Key, Default: `uuid_generate_v4()`)
    *   `user_id` (UUID, Foreign Key -> `authentication_user.id`, `on_delete=CASCADE`, Indexed)
    *   `file_path` (Varchar(500)) - Store path/URL reference.
    *   `file_name` (Varchar(255))
    *   `file_type` (Varchar(50)) - Uses standard TextChoices/Enums.
    *   `extracted_text` (TextField, Nullable)
    *   `status` (Varchar(20), Default: `"PENDING"`) - Options: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`.
    *   `created_at` (Timestamp, Default: `timezone.now`)
*   **Extensible File Types Enum (Django Choices):**
    *   `PDF` = "pdf"
    *   `IMAGE` = "image"
    *   `AUDIO` = "audio"
    *   `VIDEO` = "video"
    *   `TEXT` = "text"
    *   `MARKDOWN` = "markdown"
    *   `DOCX` = "docx"
    *   `EPUB` = "epub"
    *   `CSV` = "csv"
    *   `HTML` = "html"
    *   `YOUTUBE` = "youtube"
    *   `NOTION` = "notion"
*   **Indexes:**
    *   `status` column index for quick queue operations.

#### Table: `vault_embedding`
*   **Purpose:** Holds chunked texts and vector mappings mapped generically to any content source.
*   **Columns:**
    *   `id` (UUID, Primary Key, Default: `uuid_generate_v4()`)
    *   `source_type` (Varchar(50)) - Enforces choices: `NOTE`, `DOCUMENT`, `URL`, `AUDIO`, `VIDEO`, `IMAGE`, etc.
    *   `source_id` (UUID) - Target entity's UUID.
    *   `chunk_index` (Integer)
    *   `content_chunk` (TextField)
    *   `vector` (Vector(1536)) - Stores vector values. Dimensions match OpenAI/Gemini standard embedding outputs. Uses the `pgvector` datatype.
*   **Indexes:**
    *   Composite index on `(source_type, source_id)` for quick retrieval of embeddings by parent object.
    *   `HNSW` (Hierarchical Navigable Small World) index on the `vector` column utilizing `vector_cosine_ops` for fast similarity searches.

---

## 2. Integrity & Performance Specifications

### 2.1 Indexing Strategy
*   **Tenant Query Optimization:** Every table has a composite index or single index on `user_id` to ensure queries filtered by user are fast and do not require full table scans.
*   **FTS Search Indexes:** A GIN index on `vault_note` combining `title` and `content` supports fast lexical queries.
*   **Vector Search Indexes:** An HNSW index on the `vault_embedding` vector table is generated:
    ```sql
    CREATE INDEX vault_embedding_vector_hnsw_idx 
    ON vault_embedding USING hnsw (vector vector_cosine_ops);
    ```

### 2.2 Cascading & Data Isolation Constraints
*   **Delete Cascades:** Foreign keys pointing to `users_user` and parent entities use `on_delete=models.CASCADE` to prevent orphaned rows. Deleting a Note automatically cascades to drop its associated embeddings in the vector space (via Django signals or DB hooks triggered by `source_id`).
*   **Folder Cleanup:** Deleting a folder cascades deletion to child folders and notes contained inside them.
*   **Reference Preservation:** Deleting a Document keeps its entry but sets the document field to null in related tables where appropriate, or cascades if the document was the sole source of truth for the chunks.

---

## 3. Database Review Checklist

1.  **Strict Isolation:** Do all tables contain a `user_id` reference? (Yes, except joint table `vault_note_tags` and `vault_embedding` which inherit it implicitly from parent `note`/`document`).
2.  **Primary Keys:** Are all primary keys configured as UUIDs? (Yes, except standard django join tables which default to bigint PKs).
3.  **FTS GIN Index:** Is the combined text column indexed using standard GIN vectors? (Yes).
4.  **HNSW Index:** Is the vector column initialized with an HNSW index to prevent slow sequential table scans as the database grows? (Yes).
5.  **Uniqueness:** Are folders and tags constrained to prevent user-specific duplicates? (Yes).
