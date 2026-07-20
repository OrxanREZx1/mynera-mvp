import uuid

from django.utils import timezone
from rest_framework import generics
from rest_framework import status as http_status
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from analytics.events import EventName
from analytics.services import track_event

from .models import PaymentAmountOption, RoadmapPlan, WillingnessToPay
from .serializers import (
    ContactSubmissionSerializer,
    MockPaymentSerializer,
    WillingnessToPaySerializer,
)


def _get_wtp_or_404(request, public_id):
    """
    TƏHLÜKƏSİZLİK: lookup yalnız təxminedilməz `public_id` (UUID) ilədir —
    ardıcıl integer id-lər public API-dən çıxarılıb (IDOR fix). Əlavə olaraq,
    qeyd bir istifadəçiyə bağlıdırsa, yalnız həmin istifadəçi (və ya staff)
    ona toxuna bilər; mövcudluğu sızdırmamaq üçün icazəsiz halda 404 qaytarılır.
    """
    wtp = WillingnessToPay.objects.filter(public_id=public_id).first()
    if wtp is None:
        raise NotFound("Qeyd tapılmadı.")
    if wtp.user_id is not None:
        if not request.user.is_authenticated or (
            request.user.pk != wtp.user_id and not request.user.is_staff
        ):
            raise NotFound("Qeyd tapılmadı.")
    return wtp


class WillingnessToPayCreateView(generics.CreateAPIView):
    """
    POST /api/payments/willingness-to-pay/

    Roadmap Plan Selection (30/60 gün) + Willingness-To-Pay bir mərhələdə
    yaradılır. Anonim istifadəçilər də göndərə bilər — JWT ilə daxil
    olunubsa `user` avtomatik bağlanır.

    Avtomatik eventlər: selected_30_day_plan / selected_60_day_plan,
    willingness_price_selected, custom_price_entered.
    """

    serializer_class = WillingnessToPaySerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        wtp = serializer.save()

        plan_event = (
            EventName.SELECTED_30_DAY_PLAN
            if wtp.roadmap_plan == RoadmapPlan.DAYS_30
            else EventName.SELECTED_60_DAY_PLAN
        )
        base_meta = {"wtp_public_id": str(wtp.public_id), "recommended_branch": wtp.recommended_branch}

        track_event(plan_event, request=self.request, session_id=wtp.session_id, metadata=base_meta)
        track_event(
            EventName.WILLINGNESS_PRICE_SELECTED,
            request=self.request,
            session_id=wtp.session_id,
            metadata={**base_meta, "selected_amount": wtp.selected_amount},
        )
        if wtp.selected_amount == PaymentAmountOption.CUSTOM:
            track_event(
                EventName.CUSTOM_PRICE_ENTERED,
                request=self.request,
                session_id=wtp.session_id,
                metadata={**base_meta, "custom_amount": str(wtp.custom_amount)},
            )


class WillingnessToPayDetailView(APIView):
    """GET /api/payments/<uuid:public_id>/ — bir WTP qeydinin cari vəziyyəti."""

    permission_classes = [AllowAny]

    def get(self, request, public_id):
        wtp = _get_wtp_or_404(request, public_id)
        return Response(WillingnessToPaySerializer(wtp, context={"request": request}).data)


class MyWillingnessToPayListView(generics.ListAPIView):
    """
    GET /api/payments/my-willingness-to-pay/ — doğrulanmış istifadəçinin
    bütün roadmap/WTP tarixçəsi.
    """

    serializer_class = WillingnessToPaySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WillingnessToPay.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )


class ContinueToPaymentView(APIView):
    """
    POST /api/payments/<uuid:public_id>/continue-to-payment/

    "Continue to Payment" düyməsi. Mock axında bu tək klik istifadəçini
    birbaşa ödəniş səhifəsinə keçirdiyi üçün `clicked_continue_at` və
    `reached_payment_page_at` eyni anda qeyd olunur.

    Avtomatik eventlər: continue_to_payment_clicked, mock_payment_page_viewed.
    """

    permission_classes = [AllowAny]

    def post(self, request, public_id):
        wtp = _get_wtp_or_404(request, public_id)
        now = timezone.now()

        update_fields = ["status", "updated_at"]
        first_click = wtp.clicked_continue_at is None
        if wtp.clicked_continue_at is None:
            wtp.clicked_continue_at = now
            update_fields.append("clicked_continue_at")
        if wtp.reached_payment_page_at is None:
            wtp.reached_payment_page_at = now
            update_fields.append("reached_payment_page_at")

        wtp.status = WillingnessToPay.PaymentStatus.CONTINUED
        wtp.save(update_fields=update_fields)

        if first_click:  # təkrar kliklərdə event dublikatı yaranmasın
            meta = {"wtp_public_id": str(wtp.public_id)}
            track_event(
                EventName.CONTINUE_TO_PAYMENT_CLICKED,
                request=request,
                session_id=wtp.session_id,
                metadata=meta,
            )
            track_event(
                EventName.MOCK_PAYMENT_PAGE_VIEWED,
                request=request,
                session_id=wtp.session_id,
                metadata=meta,
            )

        return Response(WillingnessToPaySerializer(wtp, context={"request": request}).data)


class MockPaymentView(APIView):
    """
    POST /api/payments/<uuid:public_id>/mock-payment/

    Real ödəniş provayderi YOXDUR (Sprint 1 prototipi). Default olaraq
    ödəniş uğurlu sayılır və `mock_transaction_id` generasiya olunur.
    `{"simulate_failure": true}` ilə uğursuz ssenari yoxlanıla bilər
    (402 qaytarır, status dəyişmir).
    """

    permission_classes = [AllowAny]
    serializer_class = MockPaymentSerializer  # yalnız drf-spectacular sənədləşdirməsi üçün

    def post(self, request, public_id):
        wtp = _get_wtp_or_404(request, public_id)
        serializer = MockPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if serializer.validated_data["simulate_failure"]:
            return Response(
                {
                    "status": "failed",
                    "detail": "Mock ödəniş uğursuz oldu (simulate_failure=true).",
                },
                status=http_status.HTTP_402_PAYMENT_REQUIRED,
            )

        wtp.status = WillingnessToPay.PaymentStatus.PAID
        wtp.paid_at = timezone.now()
        wtp.mock_transaction_id = uuid.uuid4()
        wtp.save(update_fields=["status", "paid_at", "mock_transaction_id", "updated_at"])

        return Response(WillingnessToPaySerializer(wtp, context={"request": request}).data)


class ContactSubmissionView(APIView):
    """
    POST /api/payments/<uuid:public_id>/contact/

    "Əlaqə məlumatını burax" — ödəniş etməsə belə lead-i itirməmək üçün.
    Avtomatik event: manual_payment_contact_submitted.
    """

    permission_classes = [AllowAny]
    serializer_class = ContactSubmissionSerializer  # yalnız drf-spectacular sənədləşdirməsi üçün

    def post(self, request, public_id):
        wtp = _get_wtp_or_404(request, public_id)
        serializer = ContactSubmissionSerializer(wtp, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(
            contact_submitted_at=timezone.now(),
            status=WillingnessToPay.PaymentStatus.CONTACT_SUBMITTED,
        )

        track_event(
            EventName.MANUAL_PAYMENT_CONTACT_SUBMITTED,
            request=request,
            session_id=wtp.session_id,
            metadata={"wtp_public_id": str(wtp.public_id)},
        )
        return Response(WillingnessToPaySerializer(wtp, context={"request": request}).data)
