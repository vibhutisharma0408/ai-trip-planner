# AI Trip Planner (Next.js 16)

AI-powered trip planning app that generates a realistic day-by-day itinerary using the OpenAI Responses API and stores it in MongoDB. Built with the App Router, Clerk auth, and production-ready configs for Render.

## Tech Stack
- Next.js 16 (App Router) + React 18 + TypeScript
- Tailwind CSS + shadcn/ui primitives
- Clerk (App Router) for authentication
- MongoDB + Mongoose (models: `Trip`, `Expense`)
- OpenAI Responses API (strict JSON schema)
- Jest + React Testing Library + Playwright
- Docker (multi-stage) for production

## Architecture
- **Frontend (App Router)**
  - Pages: `app/dashboard`, `app/dashboard/[tripId]`, `app/(auth)/sign-in`, `app/(auth)/sign-up`
  - Components: `TripForm`, `TripsList`, `TripActivities`, UI in `components/ui`
  - Fast UX: streaming dashboard, prefetching, route-level `loading.tsx`

- **Backend (Server Actions + API routes)**
  - `actions/trips.ts`
    - `createTripAction`: creates a minimal trip instantly, redirects fast; AI generation runs in the background and updates the trip; paths revalidated.
    - `deleteTripAction`, `updateActivityAction` for CRUD.
  - `app/api/ai-advice/route.ts`: derives budgeting hints from expenses via OpenAI.
  - Middleware: `middleware.ts` (Clerk) protects app routes and injects user id header.

- **Database**
  - MongoDB with Mongoose models in `models/Trip.ts`, `models/Expense.ts`
  - `lib/db.ts` ensures singleton connection reuse.

## Core Features
- Secure, auth-gated dashboard and trip pages
- AI-generated day-by-day itineraries with time, location, notes, INR costs
- Fast creation flow: instant redirect to the new trip, itinerary fills in shortly after
- Full CRUD on trips and activities
- Resilient AI: JSON schema validation, retry + fallback

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
```
3) Run locally
```bash
npm run dev
```

## Deployment on Vercel
1. Push your code to GitHub.
2. Connect your GitHub repo to Vercel.
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `OPENAI_API_KEY`
4. Deploy automatically on push.

Live Demo: https://house-of-edtech-nine.vercel.app/

## Scripts
- `npm run dev` — start dev server
- `npm run build` — production build 
- `npm start` — start prod server
- `npm test` — run Jest tests
- `npm run test:e2e` — Playwright E2E tests


## Project Structure (high level)
```
app/
  dashboard/page.tsx
  dashboard/[tripId]/page.tsx
  api/ai-advice/route.ts
  (auth)/sign-in/[[...sign-in]]/page.tsx
  (auth)/sign-up/[[...sign-up]]/page.tsx
components/
  TripForm.tsx
  TripActivities.tsx
  TripsList.tsx
  ui/*
actions/
  trips.ts
lib/
  db.ts
  ai.ts
models/
  Trip.ts
  Expense.ts
```

## Links
- GitHub Repository: https://github.com/vibhutisharma0408/ai-trip-planner


