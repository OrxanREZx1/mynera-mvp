from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def health_check(_request: HttpRequest) -> JsonResponse:
    """Lightweight readiness endpoint used to wake the Render service."""

    return JsonResponse({"status": "ok"})
