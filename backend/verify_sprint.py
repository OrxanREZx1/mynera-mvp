"""Sprint 1 — Part G production-readiness verification (run: python verify_sprint.py)."""
import json
import os
import uuid
from unittest import mock

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.test import Client  # noqa: E402
from django.test.utils import override_settings  # noqa: E402

from analytics.models import Event  # noqa: E402
from career.models import Question, UserAssessment  # noqa: E402
from mentors.models import Mentor, MentorRequest  # noqa: E402
from payments.models import WillingnessToPay  # noqa: E402

PASS, FAIL = [], []


def check(name, cond, detail=""):
    (PASS if cond else FAIL).append(name)
    print(("✅" if cond else "❌"), name, detail if not cond else "")


FAKE_AI = {
    "match_percentages": {
        "Frontend Development": 40, "Backend Development": 10, "UI/UX Design": 20,
        "Data Analytics": 5, "Cybersecurity": 5, "Mobile Development": 10,
        "QA / Software Testing": 5, "Product Management": 5,
    },
    "recommended_branch": "Frontend Development",
    "why_it_fits": "Vizual nəticələri sevirsən və sürətli layihə qurmaq istəyirsən.",
    "alternative_branches": [
        {"branch": "UI/UX Design", "reason": "Dizayn marağın güclüdür."},
        {"branch": "Mobile Development", "reason": "Tətbiq qurmaq istəyin var."},
    ],
    "possible_difficulties": ["CSS layout çətinliyi", "JS asinxronluq", "Davamlılıq"],
    "strengths": ["Vizual təfəkkür", "Motivasiya", "Sürətli öyrənmə"],
    "weaknesses": ["İngilis dili", "Riyaziyyat", "Təcrübə azlığı"],
    "seven_day_plan": [{"day": i, "task": f"Gün {i} tapşırığı"} for i in range(1, 8)],
    "resources": ["freeCodeCamp", "MDN Web Docs", "CS50x"],
    "next_step": "30 günlük plana keç.",
}


class FakeMsg:
    content = json.dumps(FAKE_AI, ensure_ascii=False)


class FakeChoice:
    message = FakeMsg()


class FakeResp:
    choices = [FakeChoice()]


@override_settings(OPENAI_API_KEY="test-key")
def main():
    c = Client()
    session_id = str(uuid.uuid4())

    # ---- Analytics: client-trackable events
    r = c.post("/api/analytics/track/", data=json.dumps(
        {"event_name": "landing_page_viewed", "session_id": session_id}),
        content_type="application/json")
    check("track landing_page_viewed → 201", r.status_code == 201, r.content[:200])

    r = c.post("/api/analytics/track/", data=json.dumps(
        {"event_name": "assessment_started", "session_id": session_id}),
        content_type="application/json")
    check("track assessment_started → 201", r.status_code == 201, r.content[:200])

    r = c.post("/api/analytics/track/", data=json.dumps(
        {"event_name": "roadmap_generated", "session_id": session_id}),
        content_type="application/json")
    check("server-authoritative event rejected from client → 400", r.status_code == 400, r.content[:200])

    r = c.post("/api/analytics/track/", data=json.dumps({"event_name": "not_a_real_event"}),
               content_type="application/json")
    check("unknown event rejected → 400", r.status_code == 400)

    # ---- Questions
    r = c.get("/api/questions/")
    qdata = r.json()
    check("GET /api/questions/ → 200, 9 questions", r.status_code == 200 and len(qdata) == 9)
    check("choices hide score_weights", "score_weights" not in json.dumps(qdata))

    # ---- Submit answers (OpenAI mocked)
    answers = {str(q["id"]): q["choices"][0]["id"] for q in qdata}
    with mock.patch("career.services.OpenAI") as MockOpenAI:
        MockOpenAI.return_value.chat.completions.create.return_value = FakeResp()
        r = c.post("/api/submit-answers/", data=json.dumps(
            {"session_id": session_id, "answers": answers}),
            content_type="application/json")
    check("POST /api/submit-answers/ → 200", r.status_code == 200, r.content[:300])
    result = r.json()["result"]
    check("result has all sprint fields", all(k in result for k in [
        "match_percentages", "recommended_branch", "why_it_fits", "alternative_branches",
        "possible_difficulties", "seven_day_plan", "resources", "next_step"]))
    check("match_percentages sums to exactly 100",
          sum(result["match_percentages"].values()) == 100)
    check("8 branches in percentages", len(result["match_percentages"]) == 8)
    check("7-day plan has 7 days", len(result["seven_day_plan"]) == 7)
    check("2 alternative branches", len(result["alternative_branches"]) == 2)
    assessment_id = r.json()["assessment_id"]

    # ---- Assessment result retrieval (roadmap_viewed)
    r = c.get(f"/api/assessments/{session_id}/")
    check("GET /api/assessments/<session_id>/ → 200", r.status_code == 200)
    check("roadmap_viewed event logged",
          Event.objects.filter(event_name="roadmap_viewed").exists())

    # ---- WTP funnel (anonymous)
    r = c.post("/api/payments/willingness-to-pay/", data=json.dumps({
        "assessment_id": assessment_id, "session_id": session_id,
        "roadmap_plan": "30_days", "selected_amount": "custom", "custom_amount": "12.50",
    }), content_type="application/json")
    check("POST willingness-to-pay (custom) → 201", r.status_code == 201, r.content[:300])
    wtp = r.json()
    check("response uses public_id (no sequential id)", "public_id" in wtp and "id" not in wtp)
    check("recommended_branch snapshotted", wtp["recommended_branch"] == "Frontend Development")
    public_id = wtp["public_id"]

    # invalid: custom without amount
    r = c.post("/api/payments/willingness-to-pay/", data=json.dumps({
        "roadmap_plan": "60_days", "selected_amount": "custom"}),
        content_type="application/json")
    check("custom without custom_amount → 400", r.status_code == 400)

    # invalid: fixed amount + custom_amount
    r = c.post("/api/payments/willingness-to-pay/", data=json.dumps({
        "roadmap_plan": "60_days", "selected_amount": "10", "custom_amount": "5"}),
        content_type="application/json")
    check("fixed amount with custom_amount → 400", r.status_code == 400)

    r = c.post(f"/api/payments/{public_id}/continue-to-payment/")
    check("continue-to-payment → 200, status=continued",
          r.status_code == 200 and r.json()["status"] == "continued")

    r = c.post(f"/api/payments/{public_id}/mock-payment/", data=json.dumps(
        {"simulate_failure": True}), content_type="application/json")
    check("mock-payment simulate_failure → 402", r.status_code == 402)

    r = c.post(f"/api/payments/{public_id}/mock-payment/", data="{}",
               content_type="application/json")
    check("mock-payment success → 200, status=paid",
          r.status_code == 200 and r.json()["status"] == "paid")

    r = c.post(f"/api/payments/{public_id}/contact/", data=json.dumps(
        {"contact_full_name": "Test User", "contact_email": "lead@example.com"}),
        content_type="application/json")
    check("contact submission → 200", r.status_code == 200)

    # fresh WTP without prior contact → email/phone tələbi işləməlidir
    r = c.post("/api/payments/willingness-to-pay/", data=json.dumps({
        "roadmap_plan": "60_days", "selected_amount": "5"}),
        content_type="application/json")
    fresh_public_id = r.json()["public_id"]
    r = c.post(f"/api/payments/{fresh_public_id}/contact/", data=json.dumps(
        {"contact_full_name": "No Contact"}), content_type="application/json")
    check("contact without email/phone → 400", r.status_code == 400)

    r = c.get(f"/api/payments/{uuid.uuid4()}/")
    check("random public_id → 404 (no enumeration)", r.status_code == 404)

    # ---- Mentors
    r = c.get("/api/mentors/")
    check("GET /api/mentors/ → 200, 2 mentors", r.status_code == 200 and len(r.json()) == 2)
    check("mentor_page_viewed auto-logged",
          Event.objects.filter(event_name="mentor_page_viewed").exists())
    mentor_id = r.json()[0]["id"]

    r = c.get(f"/api/mentors/{mentor_id}/")
    check("GET mentor detail → 200", r.status_code == 200)

    r = c.post("/api/mentors/requests/", data=json.dumps({
        "mentor_id": mentor_id, "assessment_id": assessment_id,
        "topic": "Roadmap-ın 3-cü günü çaşdırıcıdır",
        "preferred_format": "chat", "willingness_to_pay": "10",
        "contact_info": "@test_telegram", "session_id": session_id,
    }), content_type="application/json")
    check("POST mentor request → 201", r.status_code == 201, r.content[:300])
    check("mentor request branch snapshotted",
          r.json()["recommended_it_branch"] == "Frontend Development")

    r = c.post("/api/mentors/requests/", data=json.dumps({
        "topic": "Kömək lazımdır", "preferred_format": "call"}),
        content_type="application/json")
    check("anonymous mentor request w/o contact → 400", r.status_code == 400)

    r = c.post("/api/mentors/requests/", data=json.dumps({
        "topic": "Custom ödəniş", "preferred_format": "chat",
        "willingness_to_pay": "custom", "contact_info": "a@b.com"}),
        content_type="application/json")
    check("mentor custom WTP without amount → 400", r.status_code == 400)

    # ---- Auth flow + anonymous claiming
    r = c.post("/api/auth/register/", data=json.dumps({
        "email": "beta@mynera.az", "full_name": "Beta İstifadəçi",
        "status": "university_student", "it_level": "know_basics",
        "password": "Str0ngPass!2026", "password2": "Str0ngPass!2026",
        "session_id": session_id,
    }), content_type="application/json")
    check("register → 201 + tokens", r.status_code == 201 and "tokens" in r.json(), r.content[:300])
    check("anonymous assessment claimed", r.json()["claimed_assessments"] == 1)
    check("anonymous WTP claimed",
          WillingnessToPay.objects.filter(user__email="beta@mynera.az").count() == 1)
    check("signup_completed logged",
          Event.objects.filter(event_name="signup_completed").exists())
    access = r.json()["tokens"]["access"]
    refresh = r.json()["tokens"]["refresh"]
    auth = {"HTTP_AUTHORIZATION": f"Bearer {access}"}

    r = c.get("/api/auth/me/", **auth)
    check("GET /api/auth/me/ → 200", r.status_code == 200)

    r = c.get("/api/my-assessments/", **auth)
    check("my-assessments shows claimed assessment",
          r.status_code == 200 and len(r.json()) == 1)

    r = c.get("/api/payments/my-willingness-to-pay/", **auth)
    check("my-willingness-to-pay → 200, 1 record", r.status_code == 200 and len(r.json()) == 1)

    # IDOR: second user must NOT access first user's WTP
    r = c.post("/api/auth/register/", data=json.dumps({
        "email": "attacker@mynera.az", "full_name": "Digər",
        "status": "graduate", "it_level": "know_nothing",
        "password": "An0therPass!2026", "password2": "An0therPass!2026",
    }), content_type="application/json")
    attacker_auth = {"HTTP_AUTHORIZATION": f"Bearer {r.json()['tokens']['access']}"}
    r = c.get(f"/api/payments/{public_id}/", **attacker_auth)
    check("IDOR blocked: other user's WTP → 404", r.status_code == 404)
    r = c.get(f"/api/assessments/{session_id}/", **attacker_auth)
    check("IDOR blocked: other user's assessment → 404", r.status_code == 404)

    # login + logout
    r = c.post("/api/auth/login/", data=json.dumps({
        "email": "beta@mynera.az", "password": "Str0ngPass!2026"}),
        content_type="application/json")
    check("login → 200", r.status_code == 200)
    r = c.post("/api/auth/logout/", data=json.dumps({"refresh": refresh}),
               content_type="application/json", **auth)
    check("logout blacklists refresh → 205", r.status_code == 205, r.content[:200])

    # ---- Analytics dashboard (staff only)
    r = c.get("/api/analytics/dashboard/", **auth)
    check("dashboard blocked for non-staff → 403", r.status_code == 403)

    from django.contrib.auth import get_user_model
    admin = get_user_model().objects.create_superuser(
        email="admin@mynera.az", password="Adm1nPass!2026", full_name="Admin")
    c.force_login(admin)
    r = c.get("/api/analytics/dashboard/")
    check("dashboard → 200 for staff", r.status_code == 200, r.content[:300])
    d = r.json()
    check("dashboard: 14 metric groups present", all(k in d for k in [
        "total_users", "assessment_starts", "assessment_completions", "roadmaps_generated",
        "roadmap_views", "roadmap_demand", "willingness_to_pay", "mock_payment",
        "contact_submission", "mentor", "recommended_branch_stats", "conversion_funnel"]))
    check("avg WTP = 8.75 ((12.50 + 5) / 2)",
          d["willingness_to_pay"]["average_azn"] == 8.75, d["willingness_to_pay"])
    check("30-day demand counted", d["roadmap_demand"]["plan_30_days"] == 1)
    check("mock payment reach rate 50% (1 of 2)", d["mock_payment"]["reach_rate_pct"] == 50.0, d["mock_payment"])
    check("funnel has 11 steps", len(d["conversion_funnel"]) == 11)

    r = c.get("/api/analytics/events/summary/")
    check("events summary → 200, all 18 names present",
          r.status_code == 200 and len(r.json()["event_counts"]) == 18)
    r = c.get("/api/analytics/events/?event_name=roadmap_generated")
    check("event list filter → 200", r.status_code == 200 and len(r.json()) >= 1)

    # ---- Admin pages render
    for url in ["/admin/", "/admin/accounts/user/", "/admin/career/question/",
                "/admin/career/userassessment/", "/admin/payments/willingnesstopay/",
                "/admin/mentors/mentor/", "/admin/mentors/mentorrequest/",
                "/admin/analytics/event/"]:
        r = c.get(url)
        check(f"admin {url} → 200", r.status_code == 200, r.status_code)

    # ---- OpenAPI schema builds
    r = c.get("/api/schema/")
    check("OpenAPI schema → 200", r.status_code == 200)

    print(f"\n{'='*50}\nPASSED: {len(PASS)}  FAILED: {len(FAIL)}")
    if FAIL:
        print("FAILURES:", FAIL)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
