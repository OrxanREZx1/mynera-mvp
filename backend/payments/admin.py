from django.contrib import admin

from .models import WillingnessToPay


@admin.register(WillingnessToPay)
class WillingnessToPayAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "public_id",
        "user",
        "roadmap_plan",
        "selected_amount",
        "final_amount_display",
        "recommended_branch",
        "status",
        "created_at",
    )
    list_filter = ("roadmap_plan", "selected_amount", "status", "created_at")
    search_fields = (
        "user__email",
        "contact_full_name",
        "contact_email",
        "contact_phone",
        "recommended_branch",
    )
    readonly_fields = (
        "public_id",
        "session_id",
        "user",
        "assessment",
        "recommended_branch",
        "mock_transaction_id",
        "reached_payment_page_at",
        "clicked_continue_at",
        "paid_at",
        "contact_submitted_at",
        "created_at",
        "updated_at",
    )
    date_hierarchy = "created_at"
    ordering = ("-created_at",)

    fieldsets = (
        ("İstifadəçi & Assessment", {"fields": ("user", "assessment", "recommended_branch")}),
        ("Roadmap & Ödəniş", {"fields": ("roadmap_plan", "selected_amount", "custom_amount", "status")}),
        (
            "Funnel Zaman Damğaları",
            {"fields": ("reached_payment_page_at", "clicked_continue_at", "paid_at", "mock_transaction_id")},
        ),
        (
            "Əlaqə Məlumatı",
            {"fields": ("contact_full_name", "contact_email", "contact_phone", "contact_submitted_at")},
        ),
        ("Tarixlər", {"fields": ("created_at", "updated_at")}),
    )

    @admin.display(description="Məbləğ (AZN)")
    def final_amount_display(self, obj):
        return obj.final_amount
