from django.contrib import admin

from .models import ChatMessageLog, RoadmapPlan


@admin.register(RoadmapPlan)
class RoadmapPlanAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "title", "recommended_field", "is_active", "created_at")
    list_filter = ("is_active", "recommended_field")
    search_fields = ("title", "user__email")


@admin.register(ChatMessageLog)
class ChatMessageLogAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "role", "created_at")
    list_filter = ("role",)
    search_fields = ("user__email", "content")
