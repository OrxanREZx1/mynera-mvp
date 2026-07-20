"""
Django settings — Minerə Beta 1.0 (Career Guide backend).
Bütün həssas dəyərlər .env-dən oxunur.
"""
import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from corsheaders.defaults import default_headers
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# .env faylını yüklə
load_dotenv(BASE_DIR / ".env")


def env_bool(key: str, default: str = "False") -> bool:
    return os.environ.get(key, default).strip().lower() in ("1", "true", "yes", "on")


def env_list(key: str, default: str = "") -> list:
    raw = os.environ.get(key, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


# --- Security ---
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-insecure-key-change-me")
DEBUG = env_bool("DEBUG", "True")
ALLOWED_HOSTS = ["*"]
GOOGLE_OAUTH_CLIENT_ID = os.environ.get("GOOGLE_OAUTH_CLIENT_ID", "").strip()

# --- OpenAI ---
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
# Əsas model .env-dən konfiqurasiya olunur. Layihə/API açarının girişi olmayan
# modellər üçün (məs. 403 model_not_found) ehtiyat model siyahısı təyin edilir —
# bunlar da .env-dən vergüllə ayrılmış siyahı kimi verilə bilər.
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_FALLBACK_MODELS = env_list("OPENAI_FALLBACK_MODELS", "gpt-4o,gpt-3.5-turbo")

# --- Applications ---
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "drf_spectacular",
    "corsheaders",
    # Local
    "accounts",
    "career",
    "payments",
    "mentors",
    "analytics",
    "aira",
    "lms",
]

# --- Custom user model ---
# DİQQƏT: bu dəyər ilkin migrasiyadan əvvəl təyin olunmalıdır. career app-ının
# 0001_initial migrasiyası artıq settings.AUTH_USER_MODEL-ə
# migrations.swappable_dependency() ilə istinad edir (auth.User-ə hardcode
# edilməyib), ona görə bu dəyişiklik köhnə migrasiyaları poza bilməz — bax
# həmçinin bu faylın sonundakı izahat qeydinə.
AUTH_USER_MODEL = "accounts.User"

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # ən yuxarıda olmalıdır
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# --- Database ---
# Render provides DATABASE_URL. Local development intentionally falls back to
# SQLite so the project can run without a separate PostgreSQL service.
DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=not DEBUG,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# --- Password validation ---
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- I18N ---
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Baku"
USE_I18N = True
USE_TZ = True

# --- Static ---
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- DRF ---
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    # Explicit AllowAny — DRF-in öz defaultu ilə eynidir, mövcud açıq
    # endpoint-lərin davranışını dəyişmir; hər view öz permission_classes-ni
    # təyin edərək qorunur (məs. IsAuthenticated).
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    # --- Throttling (Part E — security) ---
    # submit-answers OpenAI çağırışı etdiyi üçün (pul xərci + latency) xüsusi
    # aşağı limitlə qorunur; track endpoint-i event-spam-a qarşı məhdudlaşdırılır.
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": os.environ.get("THROTTLE_ANON", "120/min"),
        "user": os.environ.get("THROTTLE_USER", "240/min"),
        "submit-answers": os.environ.get("THROTTLE_SUBMIT_ANSWERS", "10/hour"),
        "analytics-track": os.environ.get("THROTTLE_ANALYTICS_TRACK", "60/min"),
        "mentor-request": os.environ.get("THROTTLE_MENTOR_REQUEST", "10/hour"),
        "aira-chat": os.environ.get("THROTTLE_AIRA_CHAT", "60/hour"),
        "aira-generate-roadmap": os.environ.get("THROTTLE_AIRA_ROADMAP", "10/hour"),
        "auth-google": os.environ.get("THROTTLE_AUTH_GOOGLE", "60/hour"),
    },
}
# Dev rahatlığı üçün browsable API
if DEBUG:
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"].append(
        "rest_framework.renderers.BrowsableAPIRenderer"
    )

# --- JWT (Simple JWT) ---
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=int(os.environ.get("JWT_ACCESS_TOKEN_LIFETIME_MIN", "15"))
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=int(os.environ.get("JWT_REFRESH_TOKEN_LIFETIME_DAYS", "7"))
    ),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# --- OpenAPI / Swagger (drf-spectacular) ---
SPECTACULAR_SETTINGS = {
    "TITLE": "Mynera API",
    "DESCRIPTION": "Mynera 1.0 Beta — Career Guide backend API sənədləşdirməsi.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    # accounts.User.status və payments.WillingnessToPay.status eyni sahə adına
    # malikdir, fərqli choices ilə — drf-spectacular enum adı kolliziyasını
    # avtomatik həll etsə də, sənədləşdirmə üçün aydın adlar veririk.
    "ENUM_NAME_OVERRIDES": {
        "UserStatusEnum": "accounts.models.USER_STATUS_CHOICES",
        "PaymentFunnelStatusEnum": "payments.models.PAYMENT_STATUS_CHOICES",
    },
}

# --- CORS ---
# MVP demo: accept requests from Vercel preview and production domains.
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = (*default_headers, "x-session-id")

# --- CSRF (SessionAuthentication + admin panel üçün) ---
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", "")

# --- Production security hardening (Part E) ---
# Yalnız DEBUG=False (production) rejimində aktivləşir — lokal http inkişafını pozmur.
if not DEBUG:
    SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", "True")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = int(os.environ.get("SECURE_HSTS_SECONDS", "31536000"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = "same-origin"
    # Render / reverse-proxy arxasında https-i düzgün tanımaq üçün
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# --- Logging (AI xətalarını konsola çıxarmaq üçün) ---
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}

# --- QEYD: AUTH_USER_MODEL haqqında ---
# Bu layihədə əvvəllər heç bir migrasiya tətbiq edilməmiş verilənlər bazası
# fərz olunur (4-günlük prototip, Sprint 1, ilk quraşdırma). Əgər real bazada
# artıq `migrate` işlədilibsə və `auth_user` cədvəlində məlumat varsa,
# AUTH_USER_MODEL-i indi dəyişmək TƏHLÜKƏLİDİR — əvvəlcə bazanı sıfırlamaq
# (fresh DB) və ya `auth_user` → `accounts_user` üçün əl ilə data-migrasiya
# yazmaq lazımdır. Fresh/hələ migrate olunmamış mühit üçün bu dəyişiklik
# tamamilə təhlükəsizdir.
