# Mynera (Yolum IT) - Project Progress

## Current Phase: Phase 5 (Deployment)

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

### 🟡 Phase 5: In Progress (Deployment)

- [x] Add Vercel SPA routing configuration.
- [x] Add Render build and production backend configuration.
- [x] Integrate verified Google sign-in/sign-up with JWT account linking and anonymous-session claiming.
- [x] Restore visible Google/Apple provider UI and user-friendly auth failure states.
- [ ] Configure the Google Cloud Web Client ID and run real-account smoke tests on local/Vercel.
- [ ] Implement real Sign in with Apple after Apple Developer credentials are available.
- [ ] Configure production environment variables on Vercel and Render.
- [ ] Deploy and run production smoke tests.
