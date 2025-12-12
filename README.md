# AI Trip Planner (Next.js 16)

AI-powered trip planning app built with Next.js App Router, Clerk authentication, MongoDB, and OpenAI Responses API with JSON Schema validation.

## Tech Stack
- Next.js 16 (App Router) + React 18 + TypeScript
- Tailwind CSS + shadcn/ui primitives
- Clerk authentication (App Router)
- MongoDB + Mongoose
- OpenAI Responses API (itinerary generation via strict JSON schema)
- Jest + React Testing Library + Playwright (tests setup)

## Core Features
- Secure auth-gated dashboard and trip detail pages (Clerk)
- Plan a trip using AI: day-by-day itinerary with time, location, notes, and realistic INR costs
- CRUD on trips (create with AI, edit activities, delete)
- Fast UX: prefetch links, streamed dashboard with `Suspense`, route-level `loading.tsx`
- Resilient AI flow: strict schema, retry + fallback

## Getting Started
1) Install dependencies
```bash
npm install
```
2) Configure environment variables in `.env.local`
```
MONGODB_URI=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
AI_API_KEY=
SENTRY_DSN=
```
3) Run locally
```bash
npm run dev
```

## Scripts
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm start` — start prod server
- `npm test` — run Jest tests
- `npm run test:e2e` — Playwright E2E tests

## Vercel Deployment Checklist
1) Connect the GitHub repository to Vercel
2) Set Environment Variables in Vercel Project Settings
   - `MONGODB_URI`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `AI_API_KEY`
   - `SENTRY_DSN` (optional)
3) Build settings
   - Framework: Next.js
   - Build Command: `next build`
   - Use Node 18+ runtime (Vercel default is fine)
4) Deploy
   - Verify routes: `/sign-in`, `/plan`, `/dashboard`, `/dashboard/[tripId]`
   - Validate AI generation works; check Sentry for errors (optional)

## Project Structure (high level)
```
app/
  plan/page.tsx
  dashboard/page.tsx
  dashboard/[tripId]/page.tsx
  api/ai-advice/route.ts
  (auth)/sign-in/[[...sign-in]]/page.tsx
  (auth)/sign-up/[[...sign-up]]/page.tsx
components/
  Navbar.tsx
  PlanContent.tsx
  TripForm.tsx
  TripActivities.tsx
  TripsList.tsx
lib/
  db.ts
  ai.ts
models/
  Trip.ts
```

## Submission
- Live URL (Vercel): <YOUR_VERCEL_DEPLOY_URL>
- GitHub Repository: <YOUR_GITHUB_REPO_URL>
- Footer credits: Add your Name, GitHub, LinkedIn in the app footer

## Contact
- GitHub: https://github.com/yourprofile
- LinkedIn: https://www.linkedin.com/in/yourprofile

