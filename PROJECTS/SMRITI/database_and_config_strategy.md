# KnowledgeOS: Migration & Configuration Specifications

This document defines the production specifications for:
1.  **Database Migration & Versioning Strategy** (Zero-downtime, naming, rollbacks, and seeding).
2.  **Environment Configuration Strategy** (Split settings system and environmental dictionary).

---

## 1. Database Migration & Versioning Strategy

Database changes are the most high-risk operations in a production system. We manage schema evolution to guarantee **integrity, traceability, and zero-downtime rolling deploys**.

### 1.1 Migration Naming & File Standards
Every migration file must represent a single logical schema change. 
*   **Command:** Run migrations specifying a name using the `--name` flag:
    ```bash
    python manage.py makemigrations <app_name> --name <descriptive_snake_case_action>
    ```
*   **File Name Format:** `[four_digit_index]_[descriptive_snake_case_action].py`
    *   *Correct:* `0003_add_note_embedding_hnsw_index.py`
    *   *Incorrect:* `0003_auto_20260627_1752.py` (Never commit auto-generated names).

### 1.2 Zero-Downtime Schema Deploys (Expand & Contract Pattern)
To modify or rename active columns/tables without locking the database or breaking queries during rolling releases:

```
[ Phase 1: Expand ] ──► [ Phase 2: Double-Write ] ──► [ Phase 3: Backfill ]
                                                              │
[ Phase 6: Contract ] ◄── [ Phase 5: Read Switch ] ◄──────────┘
```

1.  **Phase 1 (Expand):** Add the new column (`new_column`) in a migration. It must be nullable or have a database-level default. Commit and deploy.
2.  **Phase 2 (Double-Write):** Update the Django application code (serializers/repository layer) to write inputs to both `old_column` and `new_column`. (Both fields are kept in sync on writes; reads still target `old_column`). Commit and deploy.
3.  **Phase 3 (Backfill):** Execute a background script (Celery task) to migrate legacy records from `old_column` to `new_column` in batches to prevent transaction locks.
4.  **Phase 4 (Read Switch):** Update the application code to read from `new_column` only. Keep double-writes active just in case rollback is required. Deploy.
5.  **Phase 5 (Remove Double-Write):** Remove code writing to `old_column`. Deploy.
6.  **Phase 6 (Contract):** Create a final migration to drop `old_column` from the schema. Deploy and complete.

### 1.3 Seeding Strategy
*   **Fixture Prevention:** Do not use Django YAML/JSON fixtures (`loaddata`) for production environments due to primary key collision risks.
*   **Data Migrations:** Seed baseline data (e.g. system folder groups, base tags) using programmatic `migrations.RunPython`.
*   **Code Pattern:** Every data migration must provide a reversing hook for clean rollbacks:

```python
from django.db import migrations

def seed_default_tags(apps, schema_editor):
    Tag = apps.get_model('vault', 'Tag')
    default_tags = ['Work', 'Personal', 'Finance', 'Archive']
    for tag_name in default_tags:
        Tag.objects.get_or_create(name=tag_name, is_system=True)

def revert_default_tags(apps, schema_editor):
    Tag = apps.get_model('vault', 'Tag')
    Tag.objects.filter(is_system=True).delete()

class Migration(migrations.Migration):
    dependencies = [
        ('vault', '0001_initial'),
    ]
    operations = [
        migrations.RunPython(seed_default_tags, revert_default_tags),
    ]
```

### 1.4 Migration Rollback & Verification Testing
*   **Local Rollback Test:** Before pushing a migration branch, verify it reversibility locally:
    ```bash
    # Migrate forward to verify execution
    python manage.py migrate vault 0004
    # Migrate backward to verify rollback logic
    python manage.py migrate vault 0003
    ```
*   **CI Validation:** The GitHub Actions workflow executes schema checks by running migrations forward, running testing suites, rolling back, and checking for DB inconsistencies.

---

## 2. Environment Configuration Strategy

We separate configuration from code. Django settings are divided by execution environment, resolved dynamically via environment variables.

### 2.1 Directory Structure
```
backend/settings/
├── __init__.py
├── base.py                 # Core configurations common to all environments
├── development.py          # Local development flags, logging, and debug DB
├── testing.py              # In-memory DB profile, mock AI runners, eager Celery
└── production.py           # Production security keys, Sentry, AWS S3, and SMTP
```

### 2.2 Configuration Resolution
The runtime settings profile is determined by the `DJANGO_SETTINGS_MODULE` environment variable:
*   **Dev:** `DJANGO_SETTINGS_MODULE=backend.settings.development`
*   **Prod:** `DJANGO_SETTINGS_MODULE=backend.settings.production`
*   **Test:** `DJANGO_SETTINGS_MODULE=backend.settings.testing`

At startup, Django loads the corresponding settings modules, which inherit from `base.py` using Python imports:
```python
# development.py
from .base import *

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'knowledgeos_dev',
        # ...
    }
}
```

### 2.3 Environmental Variable Schema (`.env.example`)
All environment variables are documented in `.env.example` in the project root:

```ini
# ==============================================================================
# KnowledgeOS Environment Variables Schema Template
# Copy this file to '.env' and fill in values before starting the application.
# ==============================================================================

# Core Django Environment
DJANGO_SETTINGS_MODULE=backend.settings.development
SECRET_KEY=django-insecure-generate-a-strong-random-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DATABASE_URL=postgresql://db_user:db_password@localhost:5432/knowledgeos

# Task Queue (Celery / Redis)
REDIS_URL=redis://localhost:6379/0

# Observability
SENTRY_DSN=https://sentry_key@sentry_host/project_id

# AI Provider Configuration
AI_PROVIDER=gemini       # Options: gemini, openai, local
AI_API_KEY=your-api-key-here

# File Storage Configuration
STORAGE_PROVIDER=local   # Options: local, s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=

# SMTP Server / Notification Engine
EMAIL_HOST_USER=officialanchalkoli@gmail.com
EMAIL_HOST_PASSWORD=your-app-password-here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### 2.4 Environmental Rules
1.  **No Fallbacks for Production:** In `production.py`, calling `os.getenv('KEY')` must raise a `django.core.exceptions.ImproperlyConfigured` error if the variable is empty. No default fallback values are allowed for production secrets.
2.  **Stateless Injection:** Container environments (e.g. Docker, Kubernetes) inject these variables directly into the process environment instead of relying on a physical `.env` file.
