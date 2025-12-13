import PlanContent from "@/components/PlanContent";

// Mark as dynamic for faster client-side rendering
export const dynamic = "force-dynamic";

export default function PlanPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Plan</p>
          <h1 className="text-3xl font-bold text-slate-900">Create an AI trip plan</h1>
          <p className="mt-2 text-slate-600">
            Enter your destination and preferences. We will generate a structured itinerary and save it
            to your dashboard.
          </p>
        </div>
        <PlanContent />
      </div>
    </main>
  );
}

