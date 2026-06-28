# SMRITI Context

## Mission
Personal AI Second Brain and Dynamic Cognitive Vault.

## Purpose
To ingest, transcribe, OCR, parse, and semantically index diverse personal datasets (notes, web articles, PDFs, images, and audio voice clips) using a local/cloud LLM and vector database, providing a searchable and conversational RAG interface for personal knowledge management.

## Core Modules
* **Ingestion Pipeline:** Handles URL scraping, PDF text extraction, Image OCR, and Audio Transcription (Whisper).
* **Semantic Indexing:** Vector embedding generation and indexing using PostgreSQL with the `pgvector` extension.
* **Tutor & Retrieval Agent:** Contextual Q&A interface over the indexed memory database.
* **Automated Digests:** Celery-scheduled weekly digests summarizing new knowledge items via HTML email dispatch.

## Current Status
* **Active:** Initializing Django project workspace and database schema definitions.

## Approved Decisions
* SMRITI uses a decoupled Django REST Framework (DRF) backend structure.
* PostgreSQL + pgvector is the chosen database architecture to align transactional state with vector search profiles.
* Celery + Redis manages the asynchronous ingestion workflow to prevent API timeouts during OCR or speech-to-text calls.

## Next Steps
* Initialize the Django project workspace under `PROJECTS/SMRITI/`.
* Create the Django application module `vault/` to host models, views, and ingestion workers.
* Configure local database connection profiles and run migrations.
