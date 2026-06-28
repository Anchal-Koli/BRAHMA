from django.core.exceptions import ImproperlyConfigured
from .base import *
import urllib.parse as urlparse
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

DEBUG = False

def get_env_variable(var_name):
    try:
        val = os.environ[var_name]
        if not val or val.strip() == "":
            raise ImproperlyConfigured(f"The {var_name} environment variable is empty.")
        return val
    except KeyError:
        raise ImproperlyConfigured(f"The {var_name} environment variable is not set.")

SECRET_KEY = get_env_variable('SECRET_KEY')

CORS_ALLOWED_ORIGINS = [
    origin.strip() for origin in os.getenv('CORS_ALLOWED_ORIGINS', '').split(',') if origin.strip()
]

# Database - Mandatory DATABASE_URL in production
db_url = get_env_variable('DATABASE_URL')
if not db_url.startswith('postgres'):
    raise ImproperlyConfigured("DATABASE_URL must be a postgresql connection string in production.")

url = urlparse.urlparse(db_url)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': url.path[1:],
        'USER': url.username,
        'PASSWORD': url.password,
        'HOST': url.hostname,
        'PORT': url.port or 5432,
    }
}

# Sentry initialization
sentry_dsn = os.getenv('SENTRY_DSN')
if sentry_dsn:
    sentry_sdk.init(
        dsn=sentry_dsn,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1,
        send_default_pii=True,
    )

# Production security headers
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'True').lower() == 'true'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
