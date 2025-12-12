"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function AuthControls() {
  return (
    <div className="flex items-center gap-3">
      <SignedIn>
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
