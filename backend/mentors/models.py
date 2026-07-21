"""
Sprint 1 — Part A: Mentor sistemi (sprint sənədi, bölmə 10).

Pozisiya: AI roadmap-ı verir; mentor istifadəçinin sualı, çaşqınlığı və ya
şəxsi izah istəyi olduqda kömək edir. Beta üçün 2 mentor kifayətdir
(seed_sprint_data management command-ı ilə yaradılır).
"""
from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from career.models import UserAssessment


class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Mentor(models.Model):
    """Mentor kartı — mentor səhifəsində göstərilir."""

    class Category(models.TextChoices):
        AI_ML = "ai-ml", "AI & ML"
        UX_UI = "ux-ui", "UX/UI"
        BACKEND = "backend", "Backend"
        FRONTEND = "frontend", "Frontend"
        DATA = "data", "Data"
        SECURITY = "security", "Security"
        GRAPHIC_DESIGN = "graphic-design", "Graphic Design"

    name = models.CharField(max_length=150)
    expertise = models.CharField(
        max_length=150, help_text="İxtisas sahəsi, məs: 'Frontend Development'"
    )
    bio = models.TextField(help_text="Qısa bio (mentor kartında göstərilir)")
    title = models.CharField(max_length=150, blank=True, default="")
    company = models.CharField(max_length=150, blank=True, default="")
    avatar_url = models.URLField(blank=True, default="")
    cover_url = models.URLField(blank=True, default="")
    country = models.CharField(max_length=100, default="Azərbaycan")
    country_flag = models.CharField(max_length=16, default="🇦🇿")
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    price_unit = models.CharField(max_length=50, default="₼/həftəlik")
    category = models.CharField(
        max_length=32,
        choices=Category.choices,
        blank=True,
        default="",
        db_index=True,
    )
    is_free = models.BooleanField(default=False)
    discount_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    stat_sessions = models.IntegerField(default=0)
    stat_years = models.IntegerField(default=0)
    stat_students = models.IntegerField(default=0)
    stat_satisfaction = models.IntegerField(default=0)
    tags = models.ManyToManyField(
        Tag,
        related_name="tagged_mentors",
        blank=True,
    )
    skills = models.ManyToManyField(
        Tag,
        related_name="skilled_mentors",
        blank=True,
    )
    available_topics = models.JSONField(
        default=list,
        blank=True,
        help_text='Kömək mövzuları siyahısı, məs: ["Roadmap sualları", "Sahə seçimi"]',
    )
    active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Mentor"
        verbose_name_plural = "Mentorlar"

    def __str__(self):
        return f"{self.name} ({self.expertise})"

    def clean(self):
        if not isinstance(self.available_topics, list):
            raise ValidationError({"available_topics": "Siyahı (list) olmalıdır."})


class Review(models.Model):
    mentor = models.ForeignKey(
        Mentor,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    author_name = models.CharField(max_length=150)
    author_title = models.CharField(max_length=150)
    author_avatar_url = models.URLField(blank=True, default="")
    topic = models.CharField(max_length=255)
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return f"{self.mentor} · {self.rating}/5 · {self.author_name}"


class MentorApplication(models.Model):
    """An authenticated user's application to join the mentor marketplace."""

    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        UNDER_REVIEW = "under_review", "Under review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="mentor_application",
    )
    avatar = models.URLField(max_length=500, blank=True, default="")
    professional_field = models.CharField(max_length=150)
    seniority = models.CharField(max_length=50)
    experience_years = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(60)]
    )
    skills = models.JSONField(default=list)
    linkedin = models.URLField(max_length=500)
    country = models.CharField(max_length=100)
    motivation = models.TextField()
    target_mentee_types = models.JSONField(default=list)
    offered_services = models.JSONField(default=list)
    session_types = models.JSONField(default=list)
    payment_preference = models.CharField(max_length=100)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED,
        db_index=True,
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-submitted_at"]
        verbose_name = "Mentor application"
        verbose_name_plural = "Mentor applications"

    def __str__(self):
        return f"{self.user.email} · {self.get_status_display()}"

    def clean(self):
        errors = {}
        for field_name in (
            "skills",
            "target_mentee_types",
            "offered_services",
            "session_types",
        ):
            value = getattr(self, field_name)
            if not isinstance(value, list) or not value or not all(
                isinstance(item, str) and item.strip() for item in value
            ):
                errors[field_name] = "A non-empty list of text values is required."
        if errors:
            raise ValidationError(errors)


class MentorWtpOption(models.TextChoices):
    """Sprint sənədindəki mentor ödəniş seçimləri (bölmə 10)."""

    NO = "no", "Ödəməzdim"
    AMOUNT_5 = "5", "5 AZN"
    AMOUNT_10 = "10", "10 AZN"
    AMOUNT_15 = "15", "15 AZN"
    AMOUNT_20 = "20", "20 AZN"
    CUSTOM = "custom", "Custom Amount"


class PreferredFormat(models.TextChoices):
    CHAT = "chat", "Chat"
    CALL = "call", "Call"


class MentorRequest(models.Model):
    """'Request mentor help' formasının qeydi."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="mentor_requests",
    )
    mentor = models.ForeignKey(
        Mentor,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="requests",
        help_text="İstəyə bağlı — istifadəçi konkret mentor seçə bilər.",
    )
    assessment = models.ForeignKey(
        UserAssessment,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="mentor_requests",
        help_text="recommended_it_branch buradan snapshot olunur.",
    )
    recommended_it_branch = models.CharField(max_length=50, blank=True)

    topic = models.TextField(
        help_text="Nəyə kömək lazımdır / hansı mövzu çaşdırıcıdır?"
    )
    preferred_format = models.CharField(max_length=10, choices=PreferredFormat.choices)

    willingness_to_pay = models.CharField(
        max_length=10, choices=MentorWtpOption.choices, default=MentorWtpOption.NO
    )
    custom_amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Yalnız willingness_to_pay='custom' olduqda.",
    )

    contact_info = models.CharField(
        max_length=255,
        help_text="Email / telefon / Telegram — mentor əlaqə üçün.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Mentor Sorğusu"
        verbose_name_plural = "Mentor Sorğuları"

    def __str__(self):
        who = self.user or self.contact_info
        return f"MentorRequest#{self.pk} · {who} · {self.preferred_format}"

    def clean(self):
        if self.willingness_to_pay == MentorWtpOption.CUSTOM and self.custom_amount is None:
            raise ValidationError(
                {"custom_amount": "Custom seçildikdə məbləğ tələb olunur."}
            )
        if self.willingness_to_pay != MentorWtpOption.CUSTOM and self.custom_amount is not None:
            raise ValidationError(
                {"custom_amount": "custom_amount yalnız 'custom' seçildikdə doldurulmalıdır."}
            )

    @property
    def final_amount(self):
        if self.willingness_to_pay == MentorWtpOption.CUSTOM:
            return self.custom_amount
        if self.willingness_to_pay == MentorWtpOption.NO:
            return Decimal("0")
        return Decimal(self.willingness_to_pay)
