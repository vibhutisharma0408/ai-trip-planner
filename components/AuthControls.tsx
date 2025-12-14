"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useState } from "react";

export default function AuthControls() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <SignedIn>
        {/* Desktop view */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Dashboard
          </Link>
          <Link
            href="/plan"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Plan a Trip
          </Link>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>

        {/* Mobile hamburger menu */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute right-4 top-16 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/plan"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Plan a Trip
                </Link>
                <div className="border-t border-gray-100 px-4 py-2">
                  <UserButton afterSignOutUrl="/sign-in" />
                </div>
              </div>
            </div>
          )}
        </div>
      </SignedIn>
      <SignedOut>
        <Link
          href="/sign-in"
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-slate-100"
        >
          Sign In
        </Link>
      </SignedOut>
    </div>
  );
}
