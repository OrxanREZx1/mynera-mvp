from django.contrib import admin
from django.db.models import Count

from .models import Mentor, MentorApplication, MentorRequest


@admin.register(Mentor)
class MentorAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "expertise", "active", "request_count", "created_at")
    list_filter = ("active", "expertise")
    search_fields = ("name", "expertise", "bio")
    ordering = ("name",)
    readonly_fields = ("created_at",)

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_request_count=Count("requests"))

    @admin.display(description="Sorğu sayı", ordering="_request_count")
    def request_count(self, obj):
        return obj._request_count


@admin.register(MentorRequest)
class MentorRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "mentor",
        "recommended_it_branch",
        "preferred_format",
        "willingness_to_pay",
        "custom_amount",
        "short_topic",
        "contact_info",
        "created_at",
    )
    list_filter = ("preferred_format", "willingness_to_pay", "mentor", "created_at")
    search_fields = (
        "user__email",
        "contact_info",
        "topic",
        "recommended_it_branch",
        "mentor__name",
    )
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    readonly_fields = ("user", "assessment", "recommended_it_branch", "created_at")
    list_select_related = ("user", "mentor")

    @admin.display(description="Mövzu")
    def short_topic(self, obj):
        return obj.topic[:60]


@admin.register(MentorApplication)
class MentorApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "professional_field",
        "seniority",
        "experience_years",
        "country",
        "status",
        "submitted_at",
    )
    list_filter = ("status", "seniority", "professional_field", "country")
    search_fields = (
        "user__email",
        "user__full_name",
        "professional_field",
        "skills",
        "linkedin",
    )
    list_select_related = ("user",)
    ordering = ("-submitted_at",)
    readonly_fields = ("user", "submitted_at", "updated_at")
