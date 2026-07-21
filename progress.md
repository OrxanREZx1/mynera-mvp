# Mynera (Yolum IT) - Project Progress

## Current Phase: MVP Polish Complete ✅

### ✅ Sprint 3 — MVP Polish (21 July 2026)

- [x] **TASK 1 — Guest Demo Flow**: "Başla" → `/demo` → `ChatPage guestMode` (no email/password, no study hours). Auth guards: `/demo`, `/demo/roadmap`, `/mentors` public; auth pages protected.
- [x] **TASK 2 — AI Chat UI & Prompts**: ChatPage empty state with "Aira — texnologiya dünyasında AI bələdçiniz" + 4 clickable suggestion cards. Backend `AIRA_CHAT_SYSTEM_PROMPT` = Senior Principal Mentor + 3 diagnostic questions (Hazırkı vəziyyət, İT səviyyəsi, Məqsəd). Roadmap generation: exactly 4-5 modules × 4-5 lessons, field-agnostic.
- [x] **TASK 3 — Mentor Application Flow**: `MentorApplication` model + migration + serializer + ViewSet. 3-step UI (`/mentor/apply`): Profile → Profession → Service. Submit → status page. No auto-approval.
- [x] **TASK 4.1 — UI Overlap Bug**: `showCloseButton={false}` on Sheet in AppLayout, eliminating the X/Bell overlap.
- [x] **TASK 4.2 — 401 Race Condition**: RoadmapPage guards `lmsApi.myRoadmap()` behind `isAuthLoading || !isAuthenticated || !hasAccessToken`.
- [x] **TASK 4.3 — Seed Data**: 8 diverse mentors (UX/UI, Backend, DevOps, PM, QA, Frontend, Data Science, AI) with 500+ sessions each.
- [x] **TASK 4.4 — Blog/Podcast/Games Mock Data**: 8 professional blog/podcast posts (AI 2026, System Design, DevOps Roadmap, Senior Dev, Podcast Ep.12-14). 6 games (Security Shield, Data Detective, Git Quest, Algo Arena, API Builder, Flexbox Robot).
- [x] **TASK 5 — Deployment**: Migrations applied, seed_phase2 run (8 mentors), git committed and pushed.

- [ ] Test Google Login on production.
- [ ] Test "Başla" (Demo flow) on production.
- [ ] Test AIRA Chat and roadmap generation on production.

### 🟢 Phase 1: Completed (Sprint 1)

- [x] Initial project setup (Django + React).
- [x] Custom User Auth (Register/Login/JWT) with Anonymous Claiming.
- [x] AI Career Quiz & Result Generation.
- [x] Willingness to Pay (WTP) & Mock Payment Funnel.
- [x] Basic Mentor Models & Requests.
- [x] Analytics Event Tracking (18 events).

### 🟢 Phase 2: Completed (Backend Models & APIs)

- [x] Create Django `lms` app: Models for Roadmap, Modules, Lessons, UserProgress.
- [x] Expand `mentors` app: Add Rating, Price, Categories, Reviews for Marketplace.
- [x] Create `aira` app: Models for AI Chat History (User, Message, Timestamp).

### 🟡 Phase 3: In Progress (Frontend Integration)

- [x] Connect Frontend Mentor Marketplace to `/api/mentors/`.
- [x] Connect Frontend LMS (Roadmap) to `/api/lms/`.
- [x] Connect Frontend AIRA Chat and persisted history to `/api/aira/chat/`.
- [ ] Remove all mock data from frontend services.

### 🟢 Phase 4: Completed (QA & Flow Fixing)

- [x] Separate the Landing Page AIra assessment and direct registration routes.
- [x] Replace static AIRA chat responses with the real authenticated AI API.
- [x] Make the direct "Başla" onboarding a registration-free anonymous demo flow.

### 🟢 Phase 5: Completed (Deployment)

- [x] Add Vercel SPA routing configuration.
- [x] Add Render build and production backend configuration.
- [x] Integrate verified Google sign-in/sign-up with JWT account linking and anonymous-session claiming.
- [x] Restore visible Google/Apple provider UI and user-friendly auth failure states.
- [x] Configure the Google Cloud Web Client ID, publish the OAuth app, and run a real-account Vercel smoke test.
- [x] Configure production environment variables on Vercel and Render.
- [x] Deploy and run production registration, Google auth, CORS, and health smoke tests.
- [x] Remove local secrets, SQLite data, and generated Python bytecode from Git tracking.
- [x] Pass the local release gate: Django tests, migration check, ESLint, TypeScript, and Vite build.

### ⚪ Deferred / Operational Follow-up

- [ ] Implement real Sign in with Apple after Apple Developer credentials are available.
- [ ] Upgrade Render to an always-on plan before the physical stand demo.
