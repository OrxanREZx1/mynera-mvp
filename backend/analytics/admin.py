from django.contrib import admin
from django.db.models import Count

from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """Event-lər append-only-dir — admində yalnız oxunur."""

    list_display = ("id", "event_name", "user", "session_id", "short_metadata", "timestamp")
    list_filter = ("event_name", "timestamp")
    search_fields = ("user__email", "session_id", "event_name")
    ordering = ("-timestamp",)
    date_hierarchy = "timestamp"
    readonly_fields = ("user", "session_id", "event_name", "metadata", "timestamp")
    list_select_related = ("user",)

    @admin.display(description="Metadata")
    def short_metadata(self, obj):
        return str(obj.metadata)[:60]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        # Sürətli statistika — changelist-in yuxarısında event sayları
        extra_context = extra_context or {}
        summary = (
            Event.objects.values("event_name")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        extra_context["title"] = "Events — " + ", ".join(
            f"{row['event_name']}: {row['count']}" for row in summary[:8]
        ) if summary else "Events"
        return super().changelist_view(request, extra_context=extra_context)
