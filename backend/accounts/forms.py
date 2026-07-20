"""
Admin panelində istifadə olunan formalar.

`django.contrib.auth.forms.UserCreationForm/UserChangeForm` defolt olaraq
`username` sahəsi gözləyir. Bizim User modelimizdə username yoxdur, ona görə
Django-nun rəsmi sənədlərində tövsiyə olunan üsulla (Meta.fields = ("email",))
bu formaları email üçün uyğunlaşdırırıq.
"""
from django.contrib.auth.forms import UserChangeForm as BaseUserChangeForm
from django.contrib.auth.forms import UserCreationForm as BaseUserCreationForm

from .models import User


class UserCreationForm(BaseUserCreationForm):
    class Meta(BaseUserCreationForm.Meta):
        model = User
        # `full_name` mütləq sahədir (blank=False) — admin "add user" formunda
        # olmasa, save() zamanı boş qalıb model validasiyasını keçməz.
        fields = ("email", "full_name")
        field_classes = {}


class UserChangeForm(BaseUserChangeForm):
    class Meta(BaseUserChangeForm.Meta):
        model = User
        fields = "__all__"
        field_classes = {}
