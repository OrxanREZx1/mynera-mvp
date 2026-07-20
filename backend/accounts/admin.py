from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .forms import UserChangeForm, UserCreationForm
from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    """Custom istifadəçi modeli üçün admin (username sahəsi yoxdur, email istifadə olunur)."""

    add_form = UserCreationForm
    form = UserChangeForm
    model = User

    ordering = ("-date_joined",)
    list_display = (
        "id",
        "email",
        "full_name",
        "status",
        "it_level",
        "is_staff",
        "is_active",
        "date_joined",
    )
    list_filter = ("is_staff", "is_active", "status", "it_level")
    search_fields = ("email", "full_name", "phone_number", "telegram_username")
    readonly_fields = ("date_joined", "updated_at", "last_login")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Şəxsi məlumat", {"fields": ("full_name", "phone_number", "telegram_username")}),
        ("Profil", {"fields": ("status", "it_level")}),
        (
            "İcazələr",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        ("Tarixlər", {"fields": ("last_login", "date_joined", "updated_at")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "full_name", "password1", "password2"),
            },
        ),
    )
    filter_horizontal = ("groups", "user_permissions")
