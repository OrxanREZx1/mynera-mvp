"""
Part B — /track/ endpoint-i (frontend eventləri üçün).
Part C — Analytics Dashboard API-ları (yalnız admin/staff üçün).
"""
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import (
    Avg,
    Case,
    Count,
    DecimalField,
    F,
    Q,
    Value,
    When,
)
from django.db.models.functions import Cast
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from career.models import UserAssessment
from mentors.models import MentorRequest
from payments.models import PaymentAmountOption, RoadmapPlan, WillingnessToPay

from .events import EventName
from .models import Event
from .serializers import EventSerializer, TrackEventSerializer
from .services import track_event

User = get_user_model()


class TrackEventView(APIView):
    """
    POST /api/analytics/track/
    Body: {"event_name": "...", "session_id": "<uuid, optional>", "metadata": {...}}
    Anonim istifadəçilər də göndərə bilər (landing_page_viewed və s.).
    """

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "analytics-track"
    serializer_class = TrackEventSerializer  # drf-spectacular üçün

    def post(self, request):
        serializer = TrackEventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        event = track_event(
            data["event_name"],
            request=request,
            session_id=data.get("session_id"),
            metadata=data.get("metadata") or {},
            source="client",
        )
        return Response(
            {"tracked": event is not None, "event_name": data["event_name"]},
            status=status.HTTP_201_CREATED,
        )


def _event_count(name) -> int:
    return Event.objects.filter(event_name=name).count()


def _rate(numerator: int, denominator: int):
    if not denominator:
        return None
    return round(numerator / denominator * 100, 2)


def _wtp_amount_expression():
    """selected_amount ('0','5',...,'custom') → real Decimal məbləğ."""
    return Case(
        When(selected_amount=PaymentAmountOption.CUSTOM, then=F("custom_amount")),
        default=Cast("selected_amount", DecimalField(max_digits=8, decimal_places=2)),
        output_field=DecimalField(max_digits=8, decimal_places=2),
    )


class DashboardMetricsView(APIView):
    """
    GET /api/analytics/dashboard/ — Sprint 1-in bütün əsas metrikaları.
    Yalnız staff istifadəçilər üçün (admin hesabatı).
    """

    permission_classes = [IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()

        # Assessment metrikaları — mənbə həqiqəti DB cədvəlləridir,
        # "start" isə yalnız eventdən bilinir.
        assessment_starts = _event_count(EventName.ASSESSMENT_STARTED)
        assessment_completions = UserAssessment.objects.count()
        roadmaps_generated = UserAssessment.objects.filter(
            final_result__isnull=False
        ).count()
        roadmap_views = _event_count(EventName.ROADMAP_VIEWED)

        wtp_qs = WillingnessToPay.objects.all()
        wtp_total = wtp_qs.count()
        demand_30 = wtp_qs.filter(roadmap_plan=RoadmapPlan.DAYS_30).count()
        demand_60 = wtp_qs.filter(roadmap_plan=RoadmapPlan.DAYS_60).count()

        avg_wtp = wtp_qs.annotate(amount=_wtp_amount_expression()).aggregate(
            avg=Avg("amount")
        )["avg"]

        most_selected = (
            wtp_qs.values("selected_amount")
            .annotate(count=Count("id"))
            .order_by("-count", "selected_amount")
            .first()
        )

        reached_mock_payment = wtp_qs.filter(
            reached_payment_page_at__isnull=False
        ).count()
        contacts_submitted = wtp_qs.filter(contact_submitted_at__isnull=False).count()
        mock_payments_completed = wtp_qs.filter(paid_at__isnull=False).count()

        mentor_requests = MentorRequest.objects.count()

        # 13) Tövsiyə olunan sahə statistikası
        branch_from_assessments = {}
        for row in (
            UserAssessment.objects.filter(final_result__isnull=False)
            .values_list("final_result", flat=True)
        ):
            branch = (row or {}).get("recommended_branch") or (row or {}).get("top_domain")
            if branch:
                branch_from_assessments[branch] = branch_from_assessments.get(branch, 0) + 1

        branch_wtp = list(
            wtp_qs.exclude(recommended_branch="")
            .values("recommended_branch")
            .annotate(
                selections=Count("id"),
                avg_willingness=Avg(_wtp_amount_expression()),
                plan_30=Count("id", filter=Q(roadmap_plan=RoadmapPlan.DAYS_30)),
                plan_60=Count("id", filter=Q(roadmap_plan=RoadmapPlan.DAYS_60)),
            )
            .order_by("-selections")
        )

        # 14) Konversiya funnel-i (sprint user-flow ardıcıllığı ilə)
        signups = _event_count(EventName.SIGNUP_COMPLETED) or total_users
        funnel_steps = [
            ("landing_page_viewed", _event_count(EventName.LANDING_PAGE_VIEWED)),
            ("signup_completed", signups),
            ("assessment_started", assessment_starts),
            ("assessment_completed", assessment_completions),
            ("roadmap_generated", roadmaps_generated),
            ("roadmap_viewed", roadmap_views),
            ("plan_selected_30_or_60", wtp_total),
            ("continue_to_payment_clicked", wtp_qs.filter(clicked_continue_at__isnull=False).count()),
            ("mock_payment_page_reached", reached_mock_payment),
            ("mock_payment_completed", mock_payments_completed),
            ("contact_submitted", contacts_submitted),
        ]
        funnel = []
        prev = None
        for step_name, count in funnel_steps:
            funnel.append(
                {
                    "step": step_name,
                    "count": count,
                    "conversion_from_previous_pct": _rate(count, prev) if prev else None,
                }
            )
            prev = count if count else prev

        data = {
            "total_users": total_users,
            "assessment_starts": assessment_starts,
            "assessment_completions": assessment_completions,
            "roadmaps_generated": roadmaps_generated,
            "roadmap_views": roadmap_views,
            "roadmap_demand": {
                "plan_30_days": demand_30,
                "plan_60_days": demand_60,
                "total": wtp_total,
            },
            "willingness_to_pay": {
                "average_azn": round(float(avg_wtp), 2) if avg_wtp is not None else None,
                "most_selected_price": most_selected["selected_amount"] if most_selected else None,
                "most_selected_price_count": most_selected["count"] if most_selected else 0,
                "custom_price_entries": wtp_qs.filter(
                    selected_amount=PaymentAmountOption.CUSTOM
                ).count(),
            },
            "mock_payment": {
                "reached_count": reached_mock_payment,
                "reach_rate_pct": _rate(reached_mock_payment, wtp_total),
                "completed_count": mock_payments_completed,
            },
            "contact_submission": {
                "submitted_count": contacts_submitted,
                "submission_rate_pct": _rate(contacts_submitted, wtp_total),
            },
            "mentor": {
                "requests": mentor_requests,
                "request_rate_pct_of_roadmaps": _rate(mentor_requests, roadmaps_generated),
                "help_clicks": _event_count(EventName.MENTOR_HELP_CLICKED),
                "page_views": _event_count(EventName.MENTOR_PAGE_VIEWED),
            },
            "recommended_branch_stats": {
                "from_assessments": branch_from_assessments,
                "from_willingness_to_pay": branch_wtp,
            },
            "conversion_funnel": funnel,
        }
        return Response(data)


class EventCountsView(APIView):
    """GET /api/analytics/events/summary/ — hər event adının ümumi sayı (staff)."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        counts = {name: 0 for name, _ in EventName.choices}
        for row in Event.objects.values("event_name").annotate(count=Count("id")):
            counts[row["event_name"]] = row["count"]
        return Response({"event_counts": counts, "total_events": sum(counts.values())})


class EventListView(generics.ListAPIView):
    """
    GET /api/analytics/events/?event_name=...&session_id=... — xam event
    siyahısı (staff). Debug/audit üçün.
    """

    permission_classes = [IsAdminUser]
    serializer_class = EventSerializer

    def get_queryset(self):
        qs = Event.objects.select_related("user").order_by("-timestamp")
        event_name = self.request.query_params.get("event_name")
        session_id = self.request.query_params.get("session_id")
        if event_name:
            qs = qs.filter(event_name=event_name)
        if session_id:
            qs = qs.filter(session_id=session_id)
        return qs[:500]
