"""
Sprint 1 / Day 3 — Roadmap Plan Selection + Willingness-To-Pay (WTP) +
Mock Payment Funnel.

Bir istifadəçi assessment nəticəsini gördükdən sonra:
  1) 30 və ya 60 günlük roadmap planını seçir,
  2) ödəməyə hazır olduğu məbləği (və ya "custom") seçir,
  3) "Continue to Payment" düyməsini basır (mock ödəniş səhifəsinə keçid),
  4) mock ödənişi tamamlayır (real gateway YOXDUR — Sprint 1 prototipi),
  5) istəyə bağlı olaraq əlaqə məlumatını buraxır (lead capture).

Bütün bu addımlar TƏK bir `WillingnessToPay` sətrində izlənilir ki, funnel
analitikası (hansı mərhələdə hansı % itki var) sadə sorğularla çıxarıla bilsin.
"""
import uuid
from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models

from career.models import UserAssessment


class RoadmapPlan(models.TextChoices):
    """Sprint sənədindəki iki roadmap variantı."""
    DAYS_30 = "30_days", "30 Günlük Roadmap"
    DAYS_60 = "60_days", "60 Günlük Roadmap"


class PaymentAmountOption(models.TextChoices):
    """Sprint sənədindəki sabit WTP seçimləri + sərbəst məbləğ."""
    AMOUNT_0 = "0", "0 AZN"
    AMOUNT_5 = "5", "5 AZN"
    AMOUNT_10 = "10", "10 AZN"
    AMOUNT_20 = "20", "20 AZN"
    AMOUNT_30 = "30", "30 AZN"
    AMOUNT_50 = "50", "50 AZN"
    CUSTOM = "custom", "Custom Amount"


class WillingnessToPay(models.Model):
    """Roadmap seçimi + WTP + mock ödəniş funnel-inin vahid qeydi."""

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Gözləmədə (yalnız yaradıldı)"
        CONTINUED = "continued", "Continue to Payment basıldı"
        PAID = "paid", "Mock ödəniş tamamlandı"
        CONTACT_SUBMITTED = "contact_submitted", "Əlaqə məlumatı buraxıldı"

    # --- Kim / hansı assessment ---
    public_id = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        help_text=(
            "API-də istifadə olunan təxminedilməz açar. Ardıcıl integer id "
            "AllowAny endpointlərdə IDOR (başqasının qeydini sadalamaqla tapmaq) "
            "riski yaratdığı üçün bütün public lookup-lar bu UUID ilə aparılır."
        ),
    )
    session_id = models.UUIDField(
        null=True,
        blank=True,
        db_index=True,
        help_text=(
            "Anonim frontend session UUID-i — istifadəçi sonradan login/register "
            "etdikdə bu qeyd avtomatik ona bağlanır (accounts.views._claim_*)."
        ),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="willingness_to_pay_entries",
        help_text="Doğrulanmış istifadəçidirsə avtomatik bağlanır (anonim də ola bilər).",
    )
    assessment = models.ForeignKey(
        UserAssessment,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="willingness_to_pay_entries",
        help_text="Tövsiyə olunan sahə (top_domain) buradan snapshot olunur.",
    )
    recommended_branch = models.CharField(
        max_length=50,
        blank=True,
        help_text="assessment.final_result.top_domain-dan yaradılış anında köçürülür (denormalized).",
    )

    # --- 1) Roadmap Plan Selection ---
    roadmap_plan = models.CharField(max_length=10, choices=RoadmapPlan.choices)

    # --- 2) Willingness-To-Pay ---
    selected_amount = models.CharField(max_length=10, choices=PaymentAmountOption.choices)
    custom_amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Yalnız selected_amount='custom' olduqda doldurulur.",
    )

    status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )

    # --- 3) Mock Payment Flow — funnel zaman damğaları ---
    reached_payment_page_at = models.DateTimeField(null=True, blank=True)
    clicked_continue_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    mock_transaction_id = models.UUIDField(null=True, blank=True, editable=False)

    contact_full_name = models.CharField(max_length=150, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=32, blank=True)
    contact_submitted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Ödəməyə Hazırlıq (WTP)"
        verbose_name_plural = "Ödəməyə Hazırlıq Qeydləri (WTP)"

    def __str__(self):
        return f"WTP#{self.id} · {self.get_roadmap_plan_display()} · {self.get_selected_amount_display()} · {self.status}"

    def clean(self):
        if self.selected_amount == PaymentAmountOption.CUSTOM and self.custom_amount is None:
            raise ValidationError(
                {"custom_amount": "Custom Amount seçildikdə məbləğ tələb olunur."}
            )
        if self.selected_amount != PaymentAmountOption.CUSTOM and self.custom_amount is not None:
            raise ValidationError(
                {"custom_amount": "custom_amount yalnız 'custom' seçildikdə doldurulmalıdır."}
            )

    @property
    def final_amount(self) -> Decimal:
        """İstifadəçinin faktiki seçdiyi məbləğ (sabit variant və ya custom)."""
        if self.selected_amount == PaymentAmountOption.CUSTOM:
            return self.custom_amount
        return Decimal(self.selected_amount)


# Modul-səviyyəli sabit — drf-spectacular ENUM_NAME_OVERRIDES üçün
# (accounts.User.status ilə "status" adı kolliziyasını həll etmək məqsədilə,
# bax config/settings.py SPECTACULAR_SETTINGS).
PAYMENT_STATUS_CHOICES = WillingnessToPay.PaymentStatus.choices
