# Yolum IT — connected project

This folder contains both halves of the product wired to talk to each other:

```
project/
├── backend/    Django REST API
└── frontend/yolum-frontend/   React + Vite app
```

## 1. Run the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py migrate
python manage.py seed_sprint_data   # creates demo questions + 2 mentors
python manage.py runserver          # http://localhost:8000
```

`backend/.env` already has the Supabase Postgres credentials you sent:

```
DB_HOST=aws-1-ap-southeast-2.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.vzbapsrwvohwdmvtlmvt
DB_PASSWORD=thetestmynerateam
```

I couldn't test the connection to *this specific* Supabase database from my
sandbox (its network is locked to package registries only, no database
ports), so I verified the entire backend — settings, migrations, and every
endpoint below — against a local SQLite database instead, then swapped the
`.env` back to your real Postgres credentials. Run `python manage.py migrate`
yourself the first time to confirm it can reach Supabase; if it can't,
double-check the Supabase project allows connections from your IP and that
the pooler host/port are correct.

## 2. Run the frontend

```bash
cd frontend/yolum-frontend
npm install
npm run dev      # http://localhost:5173
```

`frontend/yolum-frontend/.env` now points at the backend:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

CORS on the backend is already set to allow `http://localhost:5173`
(`CORS_ALLOWED_ORIGINS` in `backend/.env`), so the two run together with no
extra config. I tested register → login → mentors-list → questions-list
end-to-end against a real running Django server and it works.

## 3. What's actually connected vs. still mock data

Reading through both codebases, the backend is a slim "Sprint 1 beta"
prototype (its own comments describe it as a 4-day build) while the
frontend is a much further-along product UI. They overlap on some features
but not all of them. Rather than fake data to make everything *look*
connected, I wired up what genuinely matches and left the rest as clearly
labeled mock data — see the comment block at the top of
`frontend/yolum-frontend/src/services/api/endpoints.ts`.

**Really wired to the Django API:**
- Auth — register, login, `/me`, logout, and automatic JWT refresh
  (`src/context/AuthContext.tsx`, `src/services/api/client.ts`)
- The sign-up form now collects `full_name` and a "who are you"
  (status) field because the backend requires them — I added these to
  `GoalStep`/`AboutAuthStep` in `src/features/onboarding/user/`
- Analytics event tracking (`analyticsApi.track(...)`), fired on the
  landing page and onboarding start
- Client functions for the career quiz, the mentor-request form, and the
  willingness-to-pay/mock-payment funnel (`careerApi`, `mentorHelpApi`,
  `paymentsApi`) — the backend supports all of these, but no existing page
  in this frontend build has UI for them yet, so they're ready to use but
  not called from any screen.

**Still mock data, on purpose:** the mentor *marketplace* (ratings, prices,
country flags, categories, search), the lesson-based roadmap/LMS, blog &
podcast content, the games section, notifications, the AIRA chat assistant,
and the pricing plans page. The backend has no models for any of these —
its "mentor" is just two static support profiles, and it has no roadmap,
content, or chat concept at all. Wiring those pages to the real API right
now would mean inventing ratings/prices/lesson content that doesn't exist,
so I left them on the existing mock layer rather than quietly fabricating
data. Building real backend support for these is a separate, bigger project
than "connect what's already there."

## 4. Mobile

I audited the frontend for mobile: the viewport meta tag is already correct,
Tailwind breakpoints (`sm:`/`lg:`) are used consistently, the main app shell
already switches from a fixed sidebar to a slide-out drawer with a mobile
header below the `lg` breakpoint (`src/app/layouts/AppLayout.tsx`), and
tables/grids collapse columns on small screens. I didn't find anything
broken, so no changes were needed here — the app was already built
mobile-responsive.

## 5. Please rotate two exposed secrets

- `backend/.env` (inside the zip you sent) contained a **live OpenAI API
  key** in plaintext. Anyone who had that zip file has it. Rotate it in
  your OpenAI dashboard and never commit `.env` to git (there's already a
  `.gitignore` entry for it).
- The Supabase DB password you pasted in this chat is now in this
  conversation's history. If this project will go anywhere near production,
  rotate that password in Supabase once you're done testing.
