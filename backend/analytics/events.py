"""
Sprint 1 sənədindəki (bölmə 11 — "Backend / API Tracking") BÜTÜN core
event adlarının vahid, kanonik siyahısı.

Bütün applar event adlarını YALNIZ buradan istifadə etməlidir — string
literal-ların təkrarlanması (typo riski) qadağandır.
"""
from django.db import models


class EventName(models.TextChoices):
    LANDING_PAGE_VIEWED = "landing_page_viewed", "Landing page viewed"
    SIGNUP_STARTED = "signup_started", "Signup started"
    SIGNUP_COMPLETED = "signup_completed", "Signup completed"
    ASSESSMENT_STARTED = "assessment_started", "Assessment started"
    ASSESSMENT_COMPLETED = "assessment_completed", "Assessment completed"
    ROADMAP_GENERATION_STARTED = "roadmap_generation_started", "Roadmap generation started"
    ROADMAP_GENERATED = "roadmap_generated", "Roadmap generated"
    ROADMAP_VIEWED = "roadmap_viewed", "Roadmap viewed"
    SELECTED_30_DAY_PLAN = "selected_30_day_plan", "Selected 30-day plan"
    SELECTED_60_DAY_PLAN = "selected_60_day_plan", "Selected 60-day plan"
    WILLINGNESS_PRICE_SELECTED = "willingness_price_selected", "Willingness price selected"
    CUSTOM_PRICE_ENTERED = "custom_price_entered", "Custom price entered"
    CONTINUE_TO_PAYMENT_CLICKED = "continue_to_payment_clicked", "Continue to payment clicked"
    MOCK_PAYMENT_PAGE_VIEWED = "mock_payment_page_viewed", "Mock payment page viewed"
    MANUAL_PAYMENT_CONTACT_SUBMITTED = (
        "manual_payment_contact_submitted",
        "Manual payment contact submitted",
    )
    MENTOR_HELP_CLICKED = "mentor_help_clicked", "Mentor help clicked"
    MENTOR_PAGE_VIEWED = "mentor_page_viewed", "Mentor page viewed"
    MENTOR_REQUEST_SUBMITTED = "mentor_request_submitted", "Mentor request submitted"


# Server tərəfdə (view/servis daxilində) avtomatik loglanan eventlər.
# Frontend bunları /api/analytics/track/ ilə göndərsə, dublikat yaranmasın
# deyə rədd edilir — mənbə həqiqəti (source of truth) serverdir.
SERVER_AUTHORITATIVE_EVENTS = frozenset(
    {
        EventName.SIGNUP_COMPLETED,
        EventName.ASSESSMENT_COMPLETED,
        EventName.ROADMAP_GENERATION_STARTED,
        EventName.ROADMAP_GENERATED,
        EventName.SELECTED_30_DAY_PLAN,
        EventName.SELECTED_60_DAY_PLAN,
        EventName.WILLINGNESS_PRICE_SELECTED,
        EventName.CUSTOM_PRICE_ENTERED,
        EventName.CONTINUE_TO_PAYMENT_CLICKED,
        EventName.MANUAL_PAYMENT_CONTACT_SUBMITTED,
        EventName.MENTOR_REQUEST_SUBMITTED,
    }
)

# Frontend-in track endpoint-i ilə göndərə biləcəyi eventlər
# (səhifə baxışları / klik-lər — serverdə təbii "hook" nöqtəsi yoxdur).
CLIENT_TRACKABLE_EVENTS = frozenset(
    {
        EventName.LANDING_PAGE_VIEWED,
        EventName.SIGNUP_STARTED,
        EventName.ASSESSMENT_STARTED,
        EventName.ROADMAP_VIEWED,
        EventName.MOCK_PAYMENT_PAGE_VIEWED,
        EventName.MENTOR_HELP_CLICKED,
        EventName.MENTOR_PAGE_VIEWED,
    }
)
