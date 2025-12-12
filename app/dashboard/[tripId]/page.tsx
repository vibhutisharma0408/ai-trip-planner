import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Trip } from "@/models/Trip";
import { deleteTripAction } from "@/actions/trips";
import { Button } from "@/components/ui/button";
import TripActivities from "@/components/TripActivities";

export default async function TripDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ tripId: string }>;
  searchParams?: { created?: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await connectDB();
  const { tripId } = await params;
  const trip = await Trip.findById(tripId).lean();
  if (!trip || trip.clerkUserId !== userId) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {searchParams?.created === "1" && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            Itinerary created successfully.
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

