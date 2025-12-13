"use client";

interface TripStatsProps {
  tripCount: number;
}

export default function TripStats({ tripCount }: TripStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="text-2xl font-bold text-blue-600">{tripCount}</div>
        <div className="text-sm text-slate-600">Total Trips</div>
      </div>
      {/* Add more stats if needed, e.g., total expenses, but keep simple */}
    </div>
  );
}