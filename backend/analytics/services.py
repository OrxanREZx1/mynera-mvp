"""
Yenidənistifadə oluna bilən tracking servisi — bütün applar event-i
YALNIZ `track_event()` vasitəsilə yazır (kod dublikasiyası yoxdur).

Dizayn prinsipləri:
- Analitika ƏSAS axını heç vaxt sındırmamalıdır: burada baş verən istənilən
  xəta udulur və yalnız loglanır (istifadəçi 500 görməməlidir).
- `request` verilərsə user/session_id avtomatik çıxarılır — çağıran kod
  təkrarlanan boilerplate yazmır.
"""
import logging
import uuid

from .models import Event

logger = logging.getLogger(__name__)

SESSION_HEADER = "X-Session-Id"  # frontend anonim session UUID-ini bu header-lə göndərir


def _parse_uuid(value):
    if not value:
        return None
    try:
        return uuid.UUID(str(value))
    except (ValueError, TypeError, AttributeError):
        return None


def extract_session_id(request):
    """Header, body və ya query-dən anonim session UUID-ini tapır."""
    if request is None:
        return None
    candidates = [request.headers.get(SESSION_HEADER)]
    data = getattr(request, "data", None)
    if isinstance(data, dict):
        candidates.append(data.get("session_id"))
    candidates.append(request.query_params.get("session_id") if hasattr(request, "query_params") else None)
    for candidate in candidates:
        parsed = _parse_uuid(candidate)
        if parsed:
            return parsed
    return None


def track_event(event_name, *, request=None, user=None, session_id=None, metadata=None, source="server"):
    """
    Vahid giriş nöqtəsi.

    track_event(EventName.ROADMAP_GENERATED, request=request,
                metadata={"assessment_id": 12})

    Heç vaxt exception atmır — uğursuzluqda None qaytarır və loglayır.
    """
    try:
        if user is None and request is not None:
            req_user = getattr(request, "user", None)
            if req_user is not None and req_user.is_authenticated:
                user = req_user
        if session_id is None:
            session_id = extract_session_id(request)
        else:
            session_id = _parse_uuid(session_id)

        payload = dict(metadata or {})
        payload.setdefault("source", source)

        return Event.objects.create(
            user=user,
            session_id=session_id,
            event_name=str(event_name),
            metadata=payload,
        )
    except Exception:  # noqa: BLE001 — analitika əsas axını sındırmamalıdır
        logger.exception("track_event uğursuz oldu: %s", event_name)
        return None
