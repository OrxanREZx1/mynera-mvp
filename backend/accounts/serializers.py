from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Profil göstərmək/yeniləmək üçün — GET/PATCH /api/auth/me/."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone_number",
            "telegram_username",
            "avatar_url",
            "status",
            "it_level",
            "date_joined",
        ]
        read_only_fields = ["id", "email", "date_joined"]


class RegisterSerializer(serializers.ModelSerializer):
    """
    POST /api/auth/register/

    `status` və `it_level` sprint sənədində sign-up üçün "Required fields"
    kimi göstərilib, ona görə burada explicit `required=True` təyin olunur
    (modelin özündə blank=True saxlanılır ki, admin panelindən istifadəçi
    yaradılarkən bu sahələr məcburi olmasın).
    """

    email = serializers.EmailField(
        error_messages={
            "blank": "E-poçt ünvanını daxil et.",
            "invalid": "Düzgün e-poçt ünvanı daxil et.",
        }
    )
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
        error_messages={
            "blank": "Şifrəni daxil et.",
            "min_length": "Şifrə ən azı 8 simvol olmalıdır.",
        },
    )
    password2 = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
        label="Şifrə (təkrar)",
        error_messages={
            "blank": "Şifrə təkrarını daxil et.",
            "min_length": "Şifrə ən azı 8 simvol olmalıdır.",
        },
    )
    status = serializers.ChoiceField(choices=User.Status.choices, required=True)
    it_level = serializers.ChoiceField(choices=User.ITLevel.choices, required=True)

    class Meta:
        model = User
        fields = [
            "email",
            "full_name",
            "phone_number",
            "telegram_username",
            "status",
            "it_level",
            "password",
            "password2",
        ]

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Bu email artıq qeydiyyatdan keçib.")
        return value

    def validate(self, attrs):
        if attrs.get("password") != attrs.pop("password2", None):
            raise serializers.ValidationError({"password2": "Şifrələr uyğun gəlmir."})
        try:
            validate_password(attrs["password"])
        except DjangoValidationError as exc:
            translated_messages = {
                "password_too_short": "Şifrə ən azı 8 simvol olmalıdır.",
                "password_too_common": "Bu şifrə çox geniş istifadə olunur. Daha güclü şifrə seç.",
                "password_entirely_numeric": "Şifrə yalnız rəqəmlərdən ibarət ola bilməz.",
                "password_too_similar": "Şifrə şəxsi məlumatlara çox oxşardır.",
            }
            messages = [
                translated_messages.get(error.code, str(error.message))
                for error in exc.error_list
            ]
            raise serializers.ValidationError({"password": messages}) from exc
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class LoginSerializer(TokenObtainPairSerializer):
    """
    POST /api/auth/login/ — email + password ilə JWT cütü (access/refresh).
    `TokenObtainPairSerializer` istifadəçi modelinin USERNAME_FIELD-ini (email)
    avtomatik sahə kimi qəbul edir, əlavə uyğunlaşdırma tələb olunmur.
    """

    pass


class GoogleAuthSerializer(serializers.Serializer):
    credential = serializers.CharField(trim_whitespace=True)
    session_id = serializers.UUIDField(required=False, allow_null=True)
    status = serializers.ChoiceField(
        choices=User.Status.choices,
        required=False,
        allow_blank=True,
        default="",
    )
    it_level = serializers.ChoiceField(
        choices=User.ITLevel.choices,
        required=False,
        allow_blank=True,
        default="",
    )


class LogoutSerializer(serializers.Serializer):
    """POST /api/auth/logout/ — refresh tokeni blacklist edir."""

    refresh = serializers.CharField()

    def validate_refresh(self, value):
        try:
            self.token = RefreshToken(value)
        except TokenError as exc:
            raise serializers.ValidationError(
                "Refresh token yanlışdır və ya vaxtı keçib."
            ) from exc
        return value
