"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import TripForm from "@/components/TripForm";

export default function PlanContent() {
  return (
    <>
      <SignedIn>
        <TripForm />
      </SignedIn>
      <SignedOut>
        <div className="max-w-md rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-semibold text-slate-900">Sign in to plan a trip</h1>
          <p className="mt-2 text-sm text-slate-600">
            You need to sign in to generate and save itineraries.
          </p>
          <div className="mt-4">
            <SignInButton mode="modal">
              <Button className="w-full">Sign in</Button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
