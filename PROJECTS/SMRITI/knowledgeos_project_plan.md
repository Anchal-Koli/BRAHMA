# KnowledgeOS: Architectural Blueprint & Project Plan (V4 - Enterprise Scaling)

This document serves as the master architectural specification and project roadmap for **KnowledgeOS**. This updated version integrates database versioning protocols, event-driven domain patterns, and environment-specific configurations.

---

## 1. Vision & Core Philosophy

KnowledgeOS is a production-grade, AI-powered Personal Knowledge Management (PKM) system built as a personal "Second Brain." It ingests, parses, OCRs, transcribes, and semantically indexes notes, PDFs, images, and audio voice clips.

### Core Architectural Decisions:
1.  **Milestone-Driven Delivery:** Features are bundled into fully tested, documented, and deployable milestones. Staging/Production deployments occur at the end of every milestone.
2.  **Domain-Driven Separation:** Business logic is decoupled from Django models and views. Packages are split into: `services/`, `repositories/`, `search/`, `ai/`, `tasks/`, and `utils/`.
3.  **Observability First:** Logging, health metrics, and Sentry tracking are configured in Milestone 1 to ensure system transparency.

---

## 2. Advanced Architectural Justifications

### 2.1 Why Django DRF-First Instead of Django Templates?
*   **Decision:** **DRF-First API Design** from Day 1. No Django HTML Templates.
*   **Justification:** Django Templates require Server-Side Rendering (SSR) where views return HTML response objects tightly coupled with the template engine. Migrating from templates to React later requires rewriting almost 100% of the Django views into DRF Serializers.
*   By designing a REST API first, the backend is a pure data provider, allowing decoupled testing and parallel frontend-backend development.

### 2.2 Data Ownership Strategy (Tenant Isolation)
*   **Authentication:** JWT verifies the identity (`request.user`).
*   **Authorization Strategy:**
    1.  **Custom DRF Permissions:** We will build a base permission class `IsOwner` that checks: `obj.user == request.user`.
    2.  **ViewSet QuerySet Restriction (Implicit Isolation):** In DRF ViewSets, `get_queryset()` will strictly enforce:
        ```python
        def get_queryset(self):
            return self.queryset.filter(user=self.request.user)
        ```
    3.  **Cascade Deletion:** All foreign key relations to users utilize `on_delete=models.CASCADE` to ensure that if a user deletes their profile, all corresponding folders, notes, documents, and embeddings are purged.

### 2.3 Hybrid Search Architecture (RRF Flow)

The search pipeline uses Reciprocal Rank Fusion (RRF) to merge keyword-based lexical search scores and concept-based vector search distances.

$$RRF\_Score(d) = \sum_{m \in M} \frac{1}{k + r_m(d)}$$
*   Where $M$ is the set of search engines (Lexical, Vector), $r_m(d)$ is the rank of document $d$ in engine $m$, and $k$ is a constant (typically 60).
*   This eliminates score calibration issues between lexical rankings and cosine distances.

### 2.4 AI Provider Abstraction
We will design a generic interface `BaseAIProvider` inside `vault/ai/provider.py`:
```python
from abc import ABC, abstractmethod

class BaseAIProvider(ABC):
    @abstractmethod
    def generate_completion(self, prompt: str, system_instruction: str = None) -> str:
        """Generates a text completion."""
        pass

    @abstractmethod
    def generate_embeddings(self, text: str) -> list[float]:
        """Generates vector embeddings for a given string."""
        pass
```
*   Concrete classes (`GeminiProvider`, `OpenAIProvider`, `LocalSentenceTransformerProvider`) implement this interface.
*   A factory class `AIFactory` reads settings from `.env` (`AI_PROVIDER=gemini`) and instantiates the correct subclass dynamically.

### 2.5 Storage Strategy
We will utilize Django's built-in File Storage engine (`django-storages` package) which abstracts filesystem operations:
*   **Development:** Local filesystem storage (`FileSystemStorage`) saving files to `media/`.
*   **Production:** Amazon S3 / Cloudflare R2 / MinIO storage (`S3Boto3Storage`).
*   **Implementation:** All file fields in models reference `default_storage`. File access is served through secure pre-signed URLs with short TTLs (Time-To-Live).

### 2.6 Plugin Architecture
To support future integrations (OCR, Notion, GitHub, Calendar) without modifying core files, we leverage a **Register/Hook (Observer) Pattern** combined with **Django Signals**:
1.  **Plugin Interface:** Define a standard base integration class `BaseIntegrationPlugin` with lifecycle hooks: `on_ingest(document)`, `on_export(note)`.
2.  **Registry:** A centralized `PluginRegistry` holds registered integrations. During ingestion, the pipeline iterates through active plugins and calls their hooks asynchronously via Celery.
3.  **Django Signals:** Core events (e.g. `note_saved`, `file_uploaded`) publish signals that active plugins listen to.

### 2.7 Database Versioning Strategy
*   **Django Migrations:** We will use Django's native migration engine as the core database version control.
*   **Migration Naming Conventions:** Every migration must be generated with a descriptive name using Django's `--name` flag:
    `python manage.py makemigrations vault --name add_note_embedding_index`
*   **Rollback Strategy:**
    *   For every migration, we must define a backward path (which Django handles automatically for standard fields, but requires a custom `reverse_code` function for run-python migrations).
    *   Rollbacks are tested in CI by migrating forward and backward: `python manage.py migrate vault 0003` (to rollback migration `0004`).
*   **Seed Data Strategy:**
    *   No manual database entry. We will use Django **data migrations** (using `migrations.RunPython`) or **fixtures** (`json/yaml` files loaded via `loaddata`) for baseline seed data.
*   **Backward Compatibility (Two-Phase Migration):**
    *   To rename a column, we follow the **Expand and Contract** pattern:
        1.  *Phase A (Deploy):* Add the new column and write to both new and old fields simultaneously.
        2.  *Phase B (Backfill):* Migrate historical data from old fields to new fields via background jobs.
        3.  *Phase C (Clean):* Remove references to old columns and drop the old fields.
        This guarantees zero-downtime during rolling updates.

### 2.8 Event-Driven Architecture (Domain Events)
To keep modules loosely coupled, we avoid direct synchronous coupling between services. We implement a decoupled event-driven pattern using **Django Signals** or **Celery Task Chains**:

```
                       +----------------------+
                       | User creates a Note  |
                       +----------+-----------+
                                  |
                                  v
                       +----------------------+
                       |  Signal Published:   |
                       |     NoteCreated      |
                       +----------+-----------+
                                  |
            +---------------------+---------------------+
            |                     |                     |
            v                     v                     v
+---------------------+ +---------------------+ +---------------------+
| Embedding Generator | |  Summary Generator  | | SearchIndex Updater |
| (Async Celery task) | | (Async Celery task) | | (Async Celery task) |
+---------------------+ +---------------------+ +---------------------+
```

*   **Task Chains:** When a note is created, it publishes a `NoteCreated` signal. Receivers spawn a Celery chain or group to execute background workflows asynchronously without blocking requests.

### 2.9 Configuration Management (Modular Settings)
We refactor the settings structure from a single file `backend/settings.py` into a modular package:
```
backend/settings/
    ├── __init__.py
    ├── settings\               # Modular Settings Package
    │   ├── __init__.py
    │   ├── base.py
    │   ├── development.py
    │   ├── testing.py
    │   └── production.py
    ├── urls.py
    └── wsgi.py
```
*   The system reads the active configuration via the `DJANGO_SETTINGS_MODULE` environment variable (e.g., `DJANGO_SETTINGS_MODULE=backend.settings.development`), default configured in `.env` and loaded in `wsgi.py` / `asgi.py` / `manage.py`.

---

## 3. Database Schema Design (Conceptual)

```
+------------------+       +------------------+       +------------------+
|    users_user    |       |   vault_folder   |       |    vault_note    |
+------------------+       +------------------+       +------------------+
| id (UUID, PK)    | <---+ | id (UUID, PK)    | <---+ | id (UUID, PK)    |
| username (Unique)|     | | user_id (FK)     |     | | user_id (FK)     |
| email (Unique)   |     | | name (Varchar)   |     | | folder_id (FK)   |
| password (Hash)  |     | | parent_id (FK)   |     | | title (Varchar)  |
| is_active (Bool) |     | | created_at       |     | | content (Text)   |
+------------------+     | +------------------+     | | created_at       |
                         |                          | | updated_at       |
                         +--------------------------+ +------------------+
                                                            |
+------------------+       +------------------+             |
|  vault_embedding |       |  vault_document  |             |
+------------------+       +------------------+             |
| id (UUID, PK)    |       | id (UUID, PK)    |             |
| note_id (FK) ----+-----> | user_id (FK)     |             |
| doc_id (FK)  ----+       | file (URL/Path)  |             |
| chunk_index (Int)|       | file_type (Str)  |             |
| content_chunk    |       | extracted_text   |             |
| vector (vector)  |       | status (Enum)    | <-----------+
+------------------+       +------------------+
```

---

## 4. Domain-Driven Folder Architecture

Inside the existing `PROJECTS/SMRITI/backend/` directory, we structure apps using Domain-Driven packages:

```
D:\BRAHMA\BRAHMA\PROJECTS\SMRITI\backend\
│
├── manage.py
├── requirements.txt
├── .env.example
├── .github/workflows/ci.yml    # CI pipeline for linting & tests
│
├── backend\                    # Project Root Configurations
│   ├── __init__.py
│   ├── settings\               # Modular Settings Package
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── testing.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
│
├── authentication\             # Authentication App
│   ├── __init__.py
│   ├── models.py               # Custom User model
│   ├── views.py                # Login/Refresh endpoints
│   ├── serializers.py          # Input validation
│   └── urls.py
│
└── vault\                      # Knowledge Vault App
    ├── __init__.py
    ├── models.py               # Note, Folder, Document, Embedding models
    ├── views.py                # API controllers (Note CRUD, search)
    ├── urls.py
    │
    ├── repositories\           # DB Access Layer (separates queries from views/models)
    │   ├── __init__.py
    │   ├── note_repo.py
    │   └── document_repo.py
    │
    ├── services\               # Business Logic Services
    │   ├── __init__.py
    │   ├── ingestion_service.py # OCR & Whisper controller
    │   └── email_service.py     # HTML Digest constructor
    │
    ├── search\                 # Semantic & Lexical Search Logic
    │   ├── __init__.py
    │   └── hybrid_search.py
    │
    ├── ai\                     # LLM / RAG integration
    │   ├── __init__.py
    │   ├── provider.py         # BaseAIProvider & Factory
    │   └── prompt_engine.py
    │
    ├── tasks\                  # Celery tasks (out-of-band execution)
    │   ├── __init__.py
    │   └── ocr_tasks.py
    │
    └── tests\                  # Structured testing
        ├── __init__.py
        ├── unit/               # Business logic unit tests
        ├── api/                # Endpoint checks with different permissions
        ├── integration/        # DB & Celery flow checks
        └── ai_pipeline/        # RAG prompt & embedding verification tests
```

---

## 5. Milestone-Driven Roadmap & Definitions of Done (DoD)

### MILESTONE 1: Core Foundation & Deployment Engine
*   **Scope:** Set up Django project, custom UUID User model, JWT Authentication endpoints, structured logging (JSON formatter), Sentry initialization, modular configurations in `backend/settings/`, and CI/CD GitHub Actions workflow. Set up a pipeline to deploy to target staging/production environment.
*   **Definition of Done (DoD):**
    1.  User Registration, Login, Token Refresh, and Logout work with JWT.
    2.  Health check endpoint `/health/` returns system database status and 200 OK.
    3.  GitHub Actions run linting (Ruff/Black) and tests on pull requests.
    4.  Application successfully deployed and accessible in the target production/staging environment.
    5.  Sentry records runtime exceptions.

### MILESTONE 2: Relational Knowledge Registry (Notes & Folders)
*   **Scope:** Notes CRUD, hierarchical folders, tagging system. Implement repository pattern, input sanitation (prevent XSS), rate limiting on creation, and API contracts.
*   **Definition of Done (DoD):**
    1.  Notes and folder models fully migrated.
    2.  Permission checks verify users can only view, edit, or delete their own notes/folders.
    3.  Sanitization (bleach) strips malicious script tags from note payloads.
    4.  Unit & API Tests achieve >90% code coverage for the notes app.
    5.  API Contract generated (OpenAPI / Swagger spec).
    6.  Deploy updated API package.

### MILESTONE 3: Secure Media Uploads & Ingestion Pipeline
*   **Scope:** File upload endpoint, Celery configuration with Redis backend, file validation service (size limits, MIME types, random UUID renaming), and asynchronous file parser structure.
*   **Definition of Done (DoD):**
    1.  File upload limits size (< 20MB) and validates MIME types via magic bytes.
    2.  Upload endpoint securely saves files to local storage (or S3 mock) with UUID naming.
    3.  Celery tasks successfully run out-of-band without blocking DRF requests.
    4.  Database records file processing states (PENDING, PROCESSING, COMPLETED, FAILED).
    5.  Test suite verifies file type restrictions and asynchronous task execution.
    6.  Deploy updated backend.

### MILESTONE 4: Semantic Retrieval (pgvector Search)
*   **Scope:** Install and configure PostgreSQL `pgvector` inside the DB profile. Create embedding services, local embedding models configuration (e.g. `sentence-transformers`), and hybrid search service (BM25 Lexical + Cosine Similarity).
*   **Definition of Done (DoD):**
    1.  Database migrations successfully create vector fields.
    2.  `HNSW` index created on vector columns for scalable similarity searches.
    3.  Hybrid search matches exact keywords and concept similarities, returning responses under 250ms for 1,000 items.
    4.  Search endpoints enforce tenant isolation (users only see search results from their own files/notes).
    5.  Deploy updated search capability.

### MILESTONE 5: AI Cognitive Integration & RAG
*   **Scope:** LLM client adapter (Gemini/OpenAI), context assembler (retrieval context + prompt template), streaming RAG endpoints, and Celery-scheduled weekly digests (email dispatch).
*   **Definition of Done (DoD):**
    1.  RAG endpoints stream answers to queries based only on retrieved context.
    2.  AI pipeline tests check prompt injection vulnerabilities.
    3.  Celery cron executes every week, constructing HTML summaries and sending them via SMTP.
    4.  Deploy updated RAG endpoints.

### MILESTONE 6: React Frontend Interface
*   **Scope:** Set up React SPA with TypeScript, Tailwind, state management (Zustand/Redux), token storage (cookies/localStorage), search panels, notes editor, and file upload zone.
*   **Definition of Done (DoD):**
    1.  Frontend successfully authenticates via JWT.
    2.  Notes editor and folder explorer render smoothly.
    3.  Search dashboard handles hybrid queries and streams RAG responses.
    4.  End-to-end integration tests (Cypress/Playwright) pass.
    5.  Build bundles are optimized and deployed to web hosting.

---

## 6. Scalability Plan

*   **User Scaling (10k+ users):** Read replicas for PostgreSQL database, Redis session caching, and stateless Django backend instances scaling behind a load balancer (Nginx).
*   **Large File Storage:** Decouple local disk storage. Use AWS S3 (or compatible object storage like MinIO) with pre-signed upload URLs so clients upload files directly to S3, bypassing Django bottlenecks.
*   **Worker Scaling:** Dedicated worker pools for different task queues (e.g., `ocr-queue` for compute-heavy tasks, `default-queue` for quick DB notifications).
*   **Vector Index Growth:** Monitor vector index sizing. Implement HNSW graph memory allocation tuning in Postgres settings as vectors scale.
