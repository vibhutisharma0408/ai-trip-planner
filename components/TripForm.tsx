"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createTripAction } from "@/actions/trips";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function TripForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await createTripAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.tripId) {
      router.push(`/dashboard/${result.tripId}?created=1`);
      router.refresh();
    } else {
      setError("Failed to create trip");
      setLoading(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await handleSubmit(fd);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Input id="destination" name="destination" placeholder="e.g., Paris, France" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="style">Travel style</Label>
          <Input id="style" name="style" placeholder="Family, solo, adventure..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input id="startDate" name="startDate" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End date</Label>
          <Input id="endDate" name="endDate" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget">Budget (INR)</Label>
          <Input id="budget" name="budget" type="number" min="0" step="500" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="travelers">Travelers</Label>
          <Input id="travelers" name="travelers" type="number" min="1" step="1" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes or preferences</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Must-see places, dietary needs, pace, etc."
        />
      </div>

      {loading && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" role="status" aria-live="polite">
          Generating itinerary. This can take up to 2–3 minutes. Please keep this tab open.
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate itinerary"}
        </Button>
        <p className="text-sm text-slate-500">
          We'll call AI, validate the plan, and save it to your account.
        </p>
      </div>
    </form>
  );
}








