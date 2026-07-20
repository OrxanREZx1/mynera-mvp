import logging

from django.apps import AppConfig
from django.conf import settings


logger = logging.getLogger(__name__)


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"
    verbose_name = "Hesablar"

    def ready(self):
        if not settings.DEBUG and not settings.GOOGLE_OAUTH_CLIENT_ID:
            logger.warning(
                "Google OAuth is disabled: set GOOGLE_OAUTH_CLIENT_ID to the same Web Client ID used by the frontend."
            )
