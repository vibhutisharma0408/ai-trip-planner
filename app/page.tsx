"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  ClerkLoaded,
  ClerkLoading
} from "@clerk/nextjs";

const features = [
  "Plan complete itineraries with AI-generated days and activities",
  "Capture budgets, travel styles, and notes to personalize trips",
  "Edit activities inline and keep everything synced in your dashboard",
  "Secure sign-in powered by Clerk"
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 via-white to-slate-100">
      {/* Decorative gradient blob */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-300/30 via-indigo-300/30 to-cyan-300/30 blur-3xl" />
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16">
        <header className="flex flex-col gap-4 text-center">
          <div className="mx-auto w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-700">
            AI Trip Planner
          </div>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
            Plan smarter trips with AI-crafted itineraries.
          </h1>
          <p className="text-base text-slate-600 sm:text-lg">
            Enter your destination and preferences, generate a structured plan, and
            keep it organized in your dashboard.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ClerkLoading>
              <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
            </ClerkLoading>
            <ClerkLoaded>
              <SignedOut>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <SignUpButton mode="modal">
                    <button className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                      Get started
                    </button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <button className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                      Plan a trip
                    </button>
                  </SignInButton>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    href="/dashboard"
                    className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Go to dashboard
                  </Link>
                </div>
              </SignedIn>
            </ClerkLoaded>
          </div>
        </header>

        <section className="grid gap-6 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200 backdrop-blur sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-slate-900">
              What you can do
            </h2>
            <ul className="space-y-3 text-slate-700">
              {features.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4 rounded-xl bg-slate-50/80 p-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Ready to try it?
            </h3>
            <p className="text-sm text-slate-600">
              Create your account to start generating itineraries and keep them in one
              place.
            </p>
            <ClerkLoading>
              <div className="flex flex-wrap gap-3">
                <div className="h-10 w-20 animate-pulse rounded-lg bg-slate-200" />
                <div className="h-10 w-20 animate-pulse rounded-lg bg-slate-200" />
              </div>
            </ClerkLoading>
            <ClerkLoaded>
              {/* Removed duplicate lower CTA for a cleaner layout */}
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                >
                  Open dashboard
                </Link>
              </SignedIn>
            </ClerkLoaded>
          </div>
        </section>
      </div>
    </main>
  );
}

