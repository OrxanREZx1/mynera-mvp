from rest_framework import serializers

from career.models import UserAssessment

from .models import PaymentAmountOption, WillingnessToPay


class WillingnessToPaySerializer(serializers.ModelSerializer):
    """
    POST /api/payments/willingness-to-pay/

    Roadmap plan seçimi (30/60 gün) + WTP məbləği TƏK sorğuda yaradılır.
    `assessment_id` göndərilərsə, `recommended_branch` avtomatik olaraq
    həmin assessment-in `final_result`-undan köçürülür.

    TƏHLÜKƏSİZLİK: cavabda `id` (ardıcıl integer) deyil, `public_id` (UUID)
    qaytarılır — bütün sonrakı funnel endpointləri (continue/mock-payment/
    contact) bu UUID ilə çağırılır. Bu, anonim AllowAny axında IDOR-un
    qarşısını alır.
    """

    assessment_id = serializers.PrimaryKeyRelatedField(
        source="assessment",
        queryset=UserAssessment.objects.all(),
        required=False,
        allow_null=True,
        write_only=True,
        help_text="İstəyə bağlı — verilərsə tövsiyə olunan sahə avtomatik doldurulur.",
    )
    session_id = serializers.UUIDField(required=False, allow_null=True)
    final_amount = serializers.DecimalField(
        max_digits=8, decimal_places=2, read_only=True
    )

    class Meta:
        model = WillingnessToPay
        fields = [
            "public_id",
            "assessment_id",
            "session_id",
            "recommended_branch",
            "roadmap_plan",
            "selected_amount",
            "custom_amount",
            "final_amount",
            "status",
            "reached_payment_page_at",
            "clicked_continue_at",
            "paid_at",
            "contact_submitted_at",
            "created_at",
        ]
        read_only_fields = [
            "public_id",
            "recommended_branch",
            "status",
            "reached_payment_page_at",
            "clicked_continue_at",
            "paid_at",
            "contact_submitted_at",
            "created_at",
        ]

    def validate(self, attrs):
        # PATCH zamanı hissəvi gələn dəyərləri, instance-dəki mövcud dəyərlə
        # birləşdirərək tam yoxlama aparırıq (custom_amount qaydası).
        selected_amount = attrs.get(
            "selected_amount",
            getattr(self.instance, "selected_amount", None),
        )
        custom_amount = attrs.get(
            "custom_amount",
            getattr(self.instance, "custom_amount", None),
        )

        if selected_amount == PaymentAmountOption.CUSTOM:
            if custom_amount is None:
                raise serializers.ValidationError(
                    {"custom_amount": "Custom Amount seçildikdə məbləğ göndərilməlidir."}
                )
            if custom_amount <= 0:
                raise serializers.ValidationError(
                    {"custom_amount": "Məbləğ 0-dan böyük olmalıdır."}
                )
        elif custom_amount is not None:
            raise serializers.ValidationError(
                {"custom_amount": "custom_amount yalnız selected_amount='custom' olduqda göndərilməlidir."}
            )
        return attrs

    def create(self, validated_data):
        assessment = validated_data.pop("assessment", None)
        recommended_branch = ""
        if assessment is not None and assessment.final_result:
            fr = assessment.final_result
            recommended_branch = fr.get("recommended_branch") or fr.get("top_domain") or ""

        request = self.context["request"]
        return WillingnessToPay.objects.create(
            user=request.user if request.user.is_authenticated else None,
            assessment=assessment,
            recommended_branch=recommended_branch,
            **validated_data,
        )


class MockPaymentSerializer(serializers.Serializer):
    """
    POST /api/payments/<public_id>/mock-payment/

    Real ödəniş gateway-i YOXDUR (Sprint 1 mock). Default: uğurlu.
    `simulate_failure=true` göndərməklə uğursuz ssenari test edilə bilər.
    """

    simulate_failure = serializers.BooleanField(required=False, default=False)


class ContactSubmissionSerializer(serializers.ModelSerializer):
    """
    POST /api/payments/<public_id>/contact/

    "Əlaqə məlumatını burax" addımı — ödəniş etməsə belə lead-i itirməmək üçün.
    Ən azı email və ya telefondan biri tələb olunur.
    """

    class Meta:
        model = WillingnessToPay
        fields = ["contact_full_name", "contact_email", "contact_phone"]

    def validate_contact_phone(self, value):
        value = value.strip()
        if value and not any(ch.isdigit() for ch in value):
            raise serializers.ValidationError("Telefon nömrəsi rəqəm ehtiva etməlidir.")
        return value

    def validate(self, attrs):
        email = attrs.get("contact_email", getattr(self.instance, "contact_email", ""))
        phone = attrs.get("contact_phone", getattr(self.instance, "contact_phone", ""))
        if not email and not phone:
            raise serializers.ValidationError(
                "Ən azı contact_email və ya contact_phone tələb olunur."
            )
        return attrs
