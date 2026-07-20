"""
Mynera custom istifadəçi modeli.

Layihə əvvəllər heç bir auth sistemi olmadığı üçün (career.UserAssessment.user
sahəsi settings.AUTH_USER_MODEL-ə swappable_dependency ilə istinad edir),
bu tətbiqi ilkin migrasiyadan əvvəl əlavə etmək təhlükəsizdir.

Email əsas identifikator kimi istifadə olunur — ayrıca `username` sahəsi
saxlanılmır (sprint sənədində sign-up "Ad" + "Email/telefon/telegram" tələb
edir; texniki login identifikatoru üçün ən sabit seçim email-dir, telefon/
telegram isə əlavə əlaqə vasitəsi kimi saxlanılır).
"""
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """
    Custom manager — `create_user` / `create_superuser` email ilə işləyir.
    `username` konsepti yoxdur, ona görə BaseUserManager-in defolt
    `create_user(username, email, password)` imzasını əvəz edirik.
    """

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("İstifadəçinin email ünvanı tələb olunur.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser is_staff=True olmalıdır.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser is_superuser=True olmalıdır.")

        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Sprint 1 sign-up sahələrinə uyğun profil:
    Ad, əlaqə (email + istəyə bağlı telefon/telegram), status, İT səviyyəsi.
    """

    class Status(models.TextChoices):
        SCHOOL_STUDENT = "school_student", _("School student")
        UNIVERSITY_STUDENT = "university_student", _("University student")
        GRADUATE = "graduate", _("Graduate")
        CAREER_SWITCHER = "career_switcher", _("Career switcher")

    class ITLevel(models.TextChoices):
        KNOW_NOTHING = "know_nothing", _("I know nothing")
        TRIED_BEFORE = "tried_before", _("I tried learning before")
        KNOW_BASICS = "know_basics", _("I know basics")
        CHOSE_FIELD_NEED_ROADMAP = (
            "chose_field_need_roadmap",
            _("I already chose a field but need a roadmap"),
        )

    email = models.EmailField(_("email address"), unique=True, db_index=True)
    full_name = models.CharField(_("full name"), max_length=150)
    phone_number = models.CharField(max_length=32, blank=True)
    telegram_username = models.CharField(max_length=64, blank=True)
    google_sub = models.CharField(max_length=255, unique=True, null=True, blank=True)
    avatar_url = models.URLField(max_length=500, blank=True)

    status = models.CharField(
        max_length=32, choices=Status.choices, blank=True,
        help_text="Sign-up zamanı seçilən cari status",
    )
    it_level = models.CharField(
        max_length=32, choices=ITLevel.choices, blank=True,
        help_text="Sign-up zamanı seçilən cari İT səviyyəsi",
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    date_joined = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        verbose_name = "İstifadəçi"
        verbose_name_plural = "İstifadəçilər"
        ordering = ["-date_joined"]

    def __str__(self):
        return self.email

    def get_full_name(self):
        return self.full_name

    def get_short_name(self):
        return self.full_name.split(" ")[0] if self.full_name else self.email


# Modul-səviyyəli sabit — drf-spectacular ENUM_NAME_OVERRIDES üçün
# (payments.WillingnessToPay.status ilə "status" adı kolliziyasını həll etmək
# məqsədilə, bax config/settings.py SPECTACULAR_SETTINGS).
USER_STATUS_CHOICES = User.Status.choices
