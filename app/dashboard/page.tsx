import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import TripsList from "@/components/TripsList";

// Ensure this route is always dynamic (avoid PPR/static rendering issues with headers/auth)
export const dynamic = "force-dynamic";

async function getUserId(): Promise<string | null> {
  try {
    const headersList = await headers();
    return headersList.get("x-clerk-user-id");
  } catch {
    return null;
  }
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ deleted?: string; created?: string }>;
}) {
  // Parallel execution for faster loading
  const [userId, sp] = await Promise.all([getUserId(), searchParams]);
  if (!userId) redirect("/sign-in");

  const deleted = sp?.deleted;
  const created = sp?.created;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {deleted === "1" && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800" role="status" aria-live="polite">
            Trip deleted
          </div>
        )}
        {created === "1" && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800" role="status" aria-live="polite">
            Itinerary created and saved to your dashboard.
          </div>
        )}

        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="h-32 animate-pulse rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200" />
                <div className="h-32 animate-pulse rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200" />
                <div className="h-32 animate-pulse rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200" />
              </div>
            </div>
          }
        >
          <TripsList userId={userId} />
        </Suspense>
      </div>
    </main>
  );
}

