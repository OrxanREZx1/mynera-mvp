from django.db import transaction
from django.db.models import Q
from google.auth.exceptions import GoogleAuthError
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from .models import User


class GoogleSignInError(Exception):
    pass


class GoogleSignInConfigurationError(GoogleSignInError):
    pass


class InvalidGoogleCredentialError(GoogleSignInError):
    pass


class GoogleProviderUnavailableError(GoogleSignInError):
    pass


class GoogleAccountConflictError(GoogleSignInError):
    pass


def verify_google_credential(credential: str, client_id: str) -> dict:
    if not client_id:
        raise GoogleSignInConfigurationError("Google girişi serverdə konfiqurasiya edilməyib.")

    try:
        payload = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            client_id,
        )
    except ValueError as exc:
        raise InvalidGoogleCredentialError("Google giriş məlumatı etibarsızdır.") from exc
    except GoogleAuthError as exc:
        raise GoogleProviderUnavailableError("Google doğrulama xidməti müvəqqəti əlçatan deyil.") from exc

    if payload.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}:
        raise InvalidGoogleCredentialError("Google token issuer-i etibarsızdır.")
    if payload.get("aud") != client_id:
        raise InvalidGoogleCredentialError("Google token audience-i etibarsızdır.")
    if payload.get("email_verified") not in {True, "true"}:
        raise InvalidGoogleCredentialError("Google email ünvanı təsdiqlənməyib.")
    if not payload.get("sub") or not payload.get("email"):
        raise InvalidGoogleCredentialError("Google hesab məlumatları natamamdır.")

    return payload


@transaction.atomic
def get_or_create_google_user(payload: dict, *, status: str = "", it_level: str = ""):
    google_sub = str(payload["sub"])
    email = User.objects.normalize_email(str(payload["email"])).lower()
    full_name = str(payload.get("name") or email.split("@", maxsplit=1)[0]).strip()
    avatar_url = str(payload.get("picture") or "").strip()

    candidates = list(
        User.objects.select_for_update().filter(
            Q(google_sub=google_sub) | Q(email__iexact=email)
        )
    )
    sub_user = next((user for user in candidates if user.google_sub == google_sub), None)
    email_user = next((user for user in candidates if user.email.lower() == email), None)

    if sub_user and email_user and sub_user.pk != email_user.pk:
        raise GoogleAccountConflictError("Google hesabı başqa email hesabı ilə əlaqələndirilib.")

    user = sub_user or email_user
    created = user is None
    if created:
        user = User.objects.create_user(
            email=email,
            password=None,
            full_name=full_name,
            google_sub=google_sub,
            avatar_url=avatar_url,
            status=status,
            it_level=it_level,
        )
        return user, True

    if not user.is_active:
        raise GoogleAccountConflictError("Bu istifadəçi hesabı deaktiv edilib.")
    if user.google_sub and user.google_sub != google_sub:
        raise GoogleAccountConflictError("Bu email başqa Google hesabı ilə əlaqələndirilib.")

    changed_fields = []
    updates = {
        "google_sub": google_sub,
        "avatar_url": avatar_url,
    }
    if sub_user and user.email.lower() != email and email_user is None:
        updates["email"] = email
    if not user.full_name:
        updates["full_name"] = full_name
    if not user.status and status:
        updates["status"] = status
    if not user.it_level and it_level:
        updates["it_level"] = it_level

    for field, value in updates.items():
        if value and getattr(user, field) != value:
            setattr(user, field, value)
            changed_fields.append(field)
    if changed_fields:
        user.save(update_fields=changed_fields)

    return user, False
