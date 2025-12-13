import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { Trip } from "@/models/Trip";
import { deleteTripAction } from "@/actions/trips";
import { Button } from "@/components/ui/button";
import TripActivities from "@/components/TripActivities";

export const dynamic = "force-dynamic";

async function getUserId(): Promise<string | null> {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-clerk-user-id");
    return userId;
  } catch {
    return null;
  }
}

export default async function TripDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  // Parallel execution for faster loading
  const [userId, paramsResolved, sp] = await Promise.all([
    getUserId(),
    params,
    searchParams
  ]);
  
  if (!userId) redirect("/sign-in");

  const { tripId } = paramsResolved;
  
  // Connect DB first, then fetch trip with optimized query
  await connectDB();
  const trip = await Trip.findById(tripId)
    .select('destination startDate endDate days clerkUserId _id')
    .lean()
    .exec();
  
  if (!trip || trip.clerkUserId !== userId) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {sp?.created === "1" && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            Itinerary created successfully.
          </div>
        )}
        {!trip.days?.length && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Generating itinerary… This will auto-fill shortly. You can stay on this page.
          </div>
        )}
        {!trip.days?.length && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Generating itinerary… This will auto-fill shortly. You can stay on this page.
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Trip
            </p>
            <h1 className="text-3xl font-bold text-slate-900">{trip.destination}</h1>
            <p className="text-sm text-slate-600">
              {trip.startDate} → {trip.endDate} · {trip.days?.length || 0} days
            </p>
          </div>
          <form action={deleteTripAction}>
            <input type="hidden" name="tripId" value={trip._id.toString()} />
            <Button variant="destructive">Delete trip</Button>
          </form>
        </div>

        <Link
          href="/dashboard"
          className="text-sm font-semibold text-blue-700 underline underline-offset-4"
        >
          Back to trips
        </Link>

        <TripActivities tripId={trip._id.toString()} days={trip.days || []} />
      </div>
    </main>
  );
}

