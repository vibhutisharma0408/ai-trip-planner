"use client";

import { useState } from "react";
import { updateActivityAction } from "@/actions/trips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Activity = {
  title: string;
  time?: string;
  location?: string;
  notes?: string;
  cost?: number;
};

type Day = {
  date: string;
  activities: Activity[];
};

export default function TripActivities({
  tripId,
  days
}: {
  tripId: string;
  days: Day[];
}) {
  const [editing, setEditing] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-4">
      {days?.map((day, dayIndex) => {
        const isEditing = !!editing[dayIndex];
        return (
          <div key={dayIndex} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Day {dayIndex + 1} — {day.date}
              </div>
              <Button
                type="button"
                variant={isEditing ? "outline" : "default"}
                onClick={() => setEditing((prev) => ({ ...prev, [dayIndex]: !prev[dayIndex] }))}
                className="h-8 px-3 text-xs"
              >
                {isEditing ? "Done" : "Edit"}
              </Button>
            </div>

            <div className="space-y-3">
              {day.activities?.map((activity, activityIndex) => (
                <form
                  key={activityIndex}
                  action={updateActivityAction}
                  className="grid gap-3 rounded-lg border border-slate-100 p-3"
                >
                  <input type="hidden" name="tripId" value={tripId} />
                  <input type="hidden" name="dayIndex" value={dayIndex} />
                  <input type="hidden" name="activityIndex" value={activityIndex} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Title</Label>
                      <Input name="title" defaultValue={activity.title} required disabled={!isEditing} />
                    </div>
                    <div className="space-y-1">
                      <Label>Time</Label>
                      <Input name="time" defaultValue={activity.time} disabled={!isEditing} />
                    </div>
                    <div className="space-y-1">
                      <Label>Location</Label>
                      <Input name="location" defaultValue={activity.location} disabled={!isEditing} />
                    </div>
                    <div className="space-y-1">
                      <Label>Cost</Label>
                      <Input name="cost" type="number" step="10" defaultValue={activity.cost} disabled={!isEditing} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Notes</Label>
                    <Textarea name="notes" defaultValue={activity.notes} disabled={!isEditing} />
                  </div>
                  {isEditing && (
                    <div className="flex justify-end">
                      <Button type="submit" variant="outline" size="sm">
                        Save activity
                      </Button>
                    </div>
                  )}
                </form>
              ))}

              {(!day.activities || day.activities.length === 0) && (
                <p className="text-sm text-slate-500">No activities for this day.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
