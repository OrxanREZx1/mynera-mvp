from django.contrib import admin

from .models import Choice, Question, UserAssessment


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 3


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "short_text", "is_active")
    list_editable = ("order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("text",)
    ordering = ("order",)
    inlines = [ChoiceInline]

    @admin.display(description="Sual")
    def short_text(self, obj):
        return obj.text[:80]


@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ("id", "question", "text", "score_weights")
    list_filter = ("question",)
    search_fields = ("text", "question__text")


@admin.register(UserAssessment)
class UserAssessmentAdmin(admin.ModelAdmin):
    list_display = ("id", "session_id", "user", "top_domain", "created_at")
    list_filter = ("created_at",)
    search_fields = ("session_id", "user__email")
    readonly_fields = ("session_id", "raw_answers", "final_result", "created_at")
    date_hierarchy = "created_at"

    @admin.display(description="Top sahə")
    def top_domain(self, obj):
        mp = (obj.final_result or {}).get("match_percentages") or {}
        return max(mp, key=mp.get) if mp else "—"