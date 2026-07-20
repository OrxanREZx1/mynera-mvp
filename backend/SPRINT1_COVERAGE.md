# Mynera Beta 1.0 — Sprint 1 Coverage Report

Status: **ALL backend Sprint 1 requirements implemented and verified (61/61 automated checks pass).**
Verification: `python manage.py migrate && python manage.py seed_sprint_data && python verify_sprint.py`

## Requirement Coverage Table

| # | Sprint Requirement | Implemented? | Location |
|---|---|---|---|
| 1 | Sign up (name, email, status, IT level) | ✅ | `accounts/` — `POST /api/auth/register/` |
| 2 | Sign in / JWT auth / logout (blacklist) | ✅ | `accounts/views.py` — `/api/auth/login/`, `/logout/`, `/token/refresh/` |
| 3 | User profile (view/update) | ✅ | `GET/PATCH /api/auth/me/` |
| 4 | AI assessment, 7–10 questions | ✅ | `career/` — 9 seeded questions (`seed_sprint_data`), `GET /api/questions/` |
| 5 | 8 IT branches (§6) | ✅ | `career/services.py` → `SKILL_DOMAINS` (was 3 — **fixed**) |
| 6 | AI result: recommended branch + why it fits + 2 alternatives + difficulties + 7-day plan + resources + next step (§5.5, §7) | ✅ | `career/services.py` Aurora prompt + `_validate_and_finalize` (was partial — **fixed**) |
| 7 | Result retrieval for result page / reloads | ✅ | `GET /api/assessments/<session_id>/` (**new**) |
| 8 | Assessment ownership saved to users (incl. anonymous → login claiming) | ✅ | `accounts/views.py` `_claim_anonymous_records` (now also claims WTP + events) |
| 9 | 30/60-day plan selection + WTP amounts (0/5/10/20/30/50/custom) (§8) | ✅ | `payments/` — `POST /api/payments/willingness-to-pay/` |
| 10 | Mock payment page + funnel timestamps (§9) | ✅ | `POST /api/payments/<public_id>/continue-to-payment/`, `/mock-payment/`, `/contact/` |
| 11 | Track: plan, price, custom price, continue click, mock page reach, contact left (§9) | ✅ | WTP fields + automatic events |
| 12 | Mentor model (name, expertise, bio, available_topics, active, created_at) | ✅ | `mentors/models.py` (**new app**) |
| 13 | MentorRequest (user, mentor, branch, topic, format chat/call, WTP no/5/10/15/20/custom, contact, created_at) (§10, §11) | ✅ | `mentors/models.py` |
| 14 | GET mentors / GET mentor detail / POST mentor request | ✅ | `/api/mentors/`, `/api/mentors/<id>/`, `/api/mentors/requests/` |
| 15 | 2 mentors for beta | ✅ | `seed_sprint_data` command |
| 16 | Event model (user, session_id, event_name, metadata JSON, timestamp) | ✅ | `analytics/models.py` (**new app**) |
| 17 | All 18 sprint events (§11) | ✅ | `analytics/events.py` — server-side auto-log + `POST /api/analytics/track/` for page-view/click events |
| 18 | Reusable tracking service, no duplication | ✅ | `analytics/services.py` → single `track_event()` used by all apps |
| 19 | Analytics metrics 1–14 (Part C) | ✅ | `GET /api/analytics/dashboard/` (staff only) + `/events/summary/` + `/events/` |
| 20 | Admin: Users, Assessments, Roadmaps, WTP, Mentor Requests, Events with search/filters/ordering/stats | ✅ | each app's `admin.py` (Event changelist shows counts; Mentor shows request counts) |
| 21 | Migrations work / imports / URLs / serializers / admin / auth / analytics / mentors / WTP / mock payment | ✅ | `verify_sprint.py` — 61 automated checks, fresh-DB migrate verified |

Landing page, generating-screen animation and UI copy are frontend responsibilities (backend supplies `landing_page_viewed` tracking and all data).

## Event Ownership Map

| Event | Logged by |
|---|---|
| landing_page_viewed, signup_started, assessment_started, roadmap_viewed*, mock_payment_page_viewed*, mentor_help_clicked, mentor_page_viewed* | frontend via `POST /api/analytics/track/` (*also auto-logged server-side where a natural hook exists) |
| signup_completed | `RegisterView` |
| assessment_completed, roadmap_generation_started, roadmap_generated | `SubmitAnswersView` |
| roadmap_viewed | `AssessmentResultView` |
| selected_30_day_plan / selected_60_day_plan, willingness_price_selected, custom_price_entered | `WillingnessToPayCreateView` |
| continue_to_payment_clicked, mock_payment_page_viewed | `ContinueToPaymentView` |
| manual_payment_contact_submitted | `ContactSubmissionView` |
| mentor_page_viewed | `MentorListView` |
| mentor_request_submitted | `MentorRequestCreateView` |

Server-authoritative events are **rejected** if a client tries to send them via `/track/` (duplicate prevention).

## Security Fixes (Part E)

1. **IDOR (high) — fixed.** WTP endpoints were `AllowAny` on sequential integer IDs; anyone could enumerate `/api/payments/1/, /2/…` and harvest contact emails/phones. Now: unguessable `public_id` UUID lookups (`payments/0002` migration backfills safely) + ownership check (owned records return 404 to other users). Same ownership rule added to `GET /api/assessments/<session_id>/`.
2. **OpenAI cost abuse — fixed.** `POST /api/submit-answers/` throttled (`10/hour` per client, configurable), plus global anon/user throttles and scoped limits on `/track/` and mentor requests.
3. **Production hardening.** With `DEBUG=False`: SSL redirect, secure cookies, HSTS (1y, preload), nosniff, referrer policy, `SECURE_PROXY_SSL_HEADER` for Render. `CSRF_TRUSTED_ORIGINS` env added.
4. **Input hygiene.** Mentor topic length limits, metadata size cap on tracking, phone sanity check on contact form, anonymous mentor requests require contact info.
5. Events are append-only in admin (add/change disabled); WTP funnel timestamps and snapshots read-only in admin.

## Breaking API change (frontend must update)

`/api/payments/<int:pk>/...` → `/api/payments/<uuid:public_id>/...`. The create response now returns `public_id` (no integer `id`). Optional `session_id` can be sent when creating WTP so anonymous records are claimed on login/register.

## New API Endpoints

```
GET  /api/assessments/<uuid:session_id>/     roadmap result (logs roadmap_viewed)
GET  /api/mentors/                            mentor cards (logs mentor_page_viewed)
GET  /api/mentors/<id>/                       mentor detail
POST /api/mentors/requests/                   request mentor help
GET  /api/mentors/my-requests/                own request history (JWT)
POST /api/analytics/track/                    frontend event tracking
GET  /api/analytics/dashboard/                14 metric groups + funnel (staff)
GET  /api/analytics/events/summary/           per-event counts (staff)
GET  /api/analytics/events/                   raw events, filterable (staff)
```

## Database schema changes

- **New:** `analytics_event`, `mentors_mentor`, `mentors_mentorrequest`
- **Changed:** `payments_willingnesstopay` + `public_id` (UUID, unique, indexed), + `session_id` (UUID, nullable, indexed)
- Migrations: `analytics/0001`, `mentors/0001`, `payments/0002` (3-step safe unique backfill), `accounts/0002` (Django 5.2 field-metadata sync, no schema effect)

## Deploy / run checklist

1. `pip install -r requirements.txt`
2. `.env`: set `SECRET_KEY`, `DEBUG=False` (prod), `OPENAI_API_KEY`, DB creds (or `DB_ENGINE=sqlite3` locally), `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`
3. `python manage.py migrate`
4. `python manage.py seed_sprint_data`
5. `python manage.py createsuperuser`
6. `python verify_sprint.py` (optional full E2E self-check, uses mocked AI)
7. `gunicorn config.wsgi` — Swagger at `/api/docs/`
