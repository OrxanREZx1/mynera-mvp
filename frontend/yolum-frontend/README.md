# Yolum IT — Frontend

A unified, production-ready React frontend for Yolum IT, rebuilt from 11 separate Figma exports (Landing, Login/Auth, User & Mentor Signup, AI Chat, Mentor Search, Mentor Profile/Dashboard, Roadmap, Blog & Podcast, Game, User Profile) into a single cohesive application with one design system, one navigation model, and full mobile responsiveness.

## Stack

React 19 - TypeScript (strict) - Vite - Tailwind CSS - Radix UI (shadcn/ui-style primitives) - React Router - React Hook Form + Zod - Framer Motion - Lucide Icons - Axios - Recharts

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`, `npm run format`, `npm run typecheck`.

## Trying it out (no backend yet)

Every page runs against mock data (`src/services/api/`), so the whole app is clickable end-to-end today:

- **Login as a student:** any email without "mentor" in it, e.g. `nigar@example.com` + any password -> lands on `/chat`.
- **Login as a mentor:** any email containing "mentor", e.g. `mentor@example.com` + any password -> lands on `/mentor/dashboard`.
- Signup wizards, AI chat, roadmap, mentor search/booking, profile settings, and the full mentor dashboard (sessions/messages/reviews/earnings) all work with realistic mock data and optimistic UI.

## Project structure

```
src/
  app/
    layouts/       MarketingLayout, AuthLayout, OnboardingLayout, AppLayout (+ MentorAppLayout)
    router/        route table (guards.tsx = auth/role redirects)
  components/
    ui/             shadcn-style primitives (button, input, dialog, sheet, tabs, toast, ...)
    shared/         domain components used across pages (MentorCard, ChatBubble, StepperHeader, ...)
  features/         one folder per product area (landing, auth, onboarding, chat, roadmap,
                     mentors, blog, games, profile, notifications, mentor-dashboard, misc)
  context/          AuthContext (mock session, persisted to localStorage)
  services/api/     mockData.ts (seed content) + endpoints.ts (async functions with the
                     same shape real Django REST calls will have) + client.ts (axios instance)
  hooks/            useMediaQuery, useFavorites
  types/            shared domain types
```

## Connecting the real backend

Nothing needs to be rearchitected. Set `VITE_API_BASE_URL` (see `.env.example`), then in
`src/services/api/endpoints.ts` swap each mock resolver for a real `apiClient.get/post` call —
the function signatures and return shapes already match what the UI expects. `apiClient`
(in `client.ts`) already attaches the JWT from `localStorage` and clears it on a 401.

## Notes on scope

- **Mentor onboarding "why work with me" reasons, plan features, FAQ, notifications, transactions** use representative content generated to match the original designs' structure and tone — swap in real copy anytime via `services/api/mockData.ts`.
- **Games** (`/games/:id`) intentionally show a "coming soon" placeholder — building four playable mini-games was out of scope for this pass; the listing, routing, and detail-page shell are ready for whenever that content exists.
- **Avatars/mentor photos** use Unsplash placeholders; the brand illustrations (Aira mascot, podcast/games/roadmap art) are the actual assets from your Figma files, carried over and optimized.
- The mentor-facing chat inbox (`/mentor/messages`) and the security/privacy policy text are wired up but will want real data once the backend exists — the privacy policy text was carried over as-is from your original English-language document (flagged in the analysis notes since it's the one place the product switches out of Azerbaijani).

## Design system quick reference

- **Color:** primary purple `#BC70DA` (scale in `tailwind.config.js` as `primary-50..900`), near-black text `ink-800`, `ink-*` for all grays.
- **Type:** DM Sans (body/UI), DM Serif Text (available as `font-display` for special headlines).
- **Radius:** pill buttons (`rounded-pill`), `rounded-lg` (20px) cards, `rounded-md` (15px) inputs.
- **Motion:** Framer Motion for section reveals/hero; kept subtle per the brief (fade/slide only).
