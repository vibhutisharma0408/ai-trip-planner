import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Trip } from "@/models/Trip";
import { Button } from "@/components/ui/button";

export default async function TripsList({ userId }: { userId: string }) {
  await connectDB();
  // Optimized query: only select needed fields, limit results, use index
  const trips = await Trip.find({ clerkUserId: userId })
    .sort({ createdAt: -1 })
    .select({ destination: 1, startDate: 1, endDate: 1, style: 1, days: 1, budget: 1, _id: 1 })
    .limit(50)
    .lean()
    .exec();

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Dashboard</p>
          <h1 className="text-3xl font-bold text-slate-900">My trips</h1>
          <p className="text-sm text-slate-600">Trips are private to your account.</p>
        </div>
        <Link href="/plan">
          <Button>Plan a trip</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip: any) => (
          <Link
            key={trip._id.toString()}
            href={`/dashboard/${trip._id.toString()}`}
            className="block rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-blue-600">{trip.destination}</div>
              <div className="text-xs text-slate-500">
                {trip.startDate} → {trip.endDate}
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-700 line-clamp-2">
              {trip.style || "Custom itinerary"}
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
              <span>{trip.days?.length || 0} days</span>
              {trip.budget ? <span>Budget: ₹{trip.budget}</span> : null}
            </div>
          </Link>
        ))}
        {trips.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-600">
            No trips yet. Start by planning one.
          </div>
        )}
      </div>
    </>
  );
}
