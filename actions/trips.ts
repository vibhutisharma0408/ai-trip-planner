"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Trip } from "@/models/Trip";
import OpenAI from "openai";
// Sentry disabled

const tripInputSchema = z.object({
  destination: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  budget: z.number().optional(),
  travelers: z.number().optional(),
  style: z.string().optional(),
  notes: z.string().optional()
});

const activitySchema = z.object({
  title: z.string(),
  time: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  cost: z.number().optional()
});

const daySchema = z.object({
  date: z.string(),
  activities: z.array(activitySchema)
});

const tripSchema = z.object({
  destination: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  budget: z.number().optional(),
  travelers: z.number().optional(),
  style: z.string().optional(),
  notes: z.string().optional(),
  days: z.array(daySchema)
});

// Avoid holding class instances at module scope in a 'use server' file.
// Initialize OpenAI client within the action when needed.

export async function createTripAction(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const parsed = tripInputSchema.safeParse({
      destination: formData.get("destination")?.toString(),
      startDate: formData.get("startDate")?.toString(),
      endDate: formData.get("endDate")?.toString(),
      budget: formData.get("budget")
        ? Number(formData.get("budget"))
        : undefined,
      travelers: formData.get("travelers")
        ? Number(formData.get("travelers"))
        : undefined,
      style: formData.get("style")?.toString(),
      notes: formData.get("notes")?.toString()
    });

    if (!parsed.success) {
      return { error: "Invalid input: " + parsed.error.message };
    }

    // Helper to build a minimal, deterministic fallback itinerary if AI is unavailable
    const buildFallback = () => {
      const start = parsed.data.startDate;
      const end = parsed.data.endDate;
      const day1 = start;
      // naive next day calculation (no tz handling needed for display strings)
      const d = new Date(start);
      d.setDate(d.getDate() + 1);
      const day2 = d.toISOString().slice(0, 10);
      return {
        destination: parsed.data.destination,
        startDate: start,
        endDate: end,
        ...(parsed.data.budget ? { budget: parsed.data.budget } : {}),
        ...(parsed.data.travelers ? { travelers: parsed.data.travelers } : {}),
        ...(parsed.data.style ? { style: parsed.data.style } : {}),
        ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
        days: [
          {
            date: day1,
            activities: [
              { title: "Arrival & Check-in", time: "09:00", location: "Hotel lobby", notes: "Check in, drop luggage, quick breakfast nearby", cost: 500 },
              { title: "Local sightseeing", time: "12:00", location: "City center landmarks", notes: "Walkable highlights tour and photo stops", cost: 200 }
            ]
          },
          {
            date: day2,
            activities: [
              { title: "City highlights tour", time: "10:00", location: "Hop-on hop-off / guided tour", notes: "Include museum or viewpoint stop", cost: 1500 },
              { title: "Dinner at a popular spot", time: "19:30", location: "Well-rated local restaurant", notes: "Reserve table; try regional specialty", cost: 1200 }
            ]
          }
        ]
      };
    };

  const prompt = `You are an expert travel planner. Generate a detailed trip itinerary for:
Destination: ${parsed.data.destination}
Dates: ${parsed.data.startDate} to ${parsed.data.endDate}
${parsed.data.budget ? `Budget: ₹${parsed.data.budget}` : ""}
${parsed.data.travelers ? `Travelers: ${parsed.data.travelers}` : ""}
${parsed.data.style ? `Style: ${parsed.data.style}` : ""}
${parsed.data.notes ? `Notes: ${parsed.data.notes}` : ""}

Generate a day-by-day itinerary with activities. Every activity MUST include these fields: title (string), time (HH:MM), location (string), notes (string), cost (number). Costs must be realistic, non-zero INR estimates based on the activity and destination; provide concise actionable notes (reservations, tickets, transit, duration). Return ONLY valid JSON matching this structure:
{
  "destination": "${parsed.data.destination}",
  "startDate": "${parsed.data.startDate}",
  "endDate": "${parsed.data.endDate}",
  ${parsed.data.budget ? `"budget": ${parsed.data.budget},` : ""}
  ${parsed.data.travelers ? `"travelers": ${parsed.data.travelers},` : ""}
  ${parsed.data.style ? `"style": "${parsed.data.style}",` : ""}
  ${parsed.data.notes ? `"notes": "${parsed.data.notes}",` : ""}
  "days": [
    {
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "title": "Activity name",
          "time": "HH:MM",
          "location": "Location",
          "notes": "Details",
          "cost": 1000
        }
      ]
    }
  ]
}`;
    let validated: z.infer<typeof tripSchema>;
    // Build a strict JSON schema for the Responses API to reduce parsing errors
    const itinerarySchemaObject = {
      type: "object",
      additionalProperties: false,
      properties: {
        destination: { type: "string" },
        startDate: { type: "string" },
        endDate: { type: "string" },
        budget: { type: "number" },
        travelers: { type: "number" },
        style: { type: "string" },
        notes: { type: "string" },
        days: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              date: { type: "string" },
              activities: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    title: { type: "string" },
                    time: { type: "string" },
                    location: { type: "string" },
                    notes: { type: "string" },
                    cost: { type: "number" }
                  },
                  required: ["title", "time", "location", "notes", "cost"]
                }
              }
            },
            required: ["date", "activities"]
          }
        }
      },
      required: ["destination", "startDate", "endDate", "days"]
    } as const;

    async function tryGenerateViaAI(): Promise<z.infer<typeof tripSchema>> {
      if (!process.env.AI_API_KEY) throw new Error("NO_AI_KEY");
      const openai = new OpenAI({ apiKey: process.env.AI_API_KEY });
      const call = openai.responses.create({
        model: "gpt-4o-mini",
        input: prompt,
        temperature: 0.2
      });
      // 30s timeout race
      const result = await Promise.race([
        call,
        new Promise((_, reject) => setTimeout(() => reject(new Error("AI_TIMEOUT")), 30000))
      ]);
      const content = (result as any).output_text as string | undefined;
      if (!content) throw new Error("NO_CONTENT");
      const parsedJson = JSON.parse(content);
      return tripSchema.parse(parsedJson);
    }

    try {
      validated = await tryGenerateViaAI();
    } catch {
      // one quick retry
      try {
        validated = await tryGenerateViaAI();
      } catch {
        validated = tripSchema.parse(buildFallback());
      }
    }

    // Do not normalize with defaults; rely on AI/schema to provide full fields

    await connectDB();
    const created = await Trip.create({
      ...validated,
      clerkUserId: userId
    });

    revalidatePath("/dashboard");
    // Return only minimal, fully-serializable data to the client
    return { tripId: created._id.toString() };
  } catch (error: any) {
    return { error: error.message || "Failed to create trip" };
  }
}

export async function deleteTripAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const tripId = formData.get("tripId")?.toString();
  if (!tripId) throw new Error("Missing tripId");

  await connectDB();
  const trip = await Trip.findById(tripId);
  if (!trip || trip.clerkUserId !== userId) throw new Error("Forbidden");

  await Trip.findByIdAndDelete(tripId);
  revalidatePath("/dashboard");
  // Redirect away from the deleted trip page to avoid 404 and show confirmation
  redirect("/dashboard?deleted=1");
}

const updateActivitySchema = z.object({
  tripId: z.string(),
  dayIndex: z.number().int().nonnegative(),
  activityIndex: z.number().int().nonnegative(),
  title: z.string(),
  time: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  cost: z.number().optional()
});

export async function updateActivityAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = updateActivitySchema.safeParse({
    tripId: formData.get("tripId")?.toString(),
    dayIndex: Number(formData.get("dayIndex")),
    activityIndex: Number(formData.get("activityIndex")),
    title: formData.get("title")?.toString(),
    time: formData.get("time")?.toString(),
    location: formData.get("location")?.toString(),
    notes: formData.get("notes")?.toString(),
    cost: formData.get("cost") ? Number(formData.get("cost")) : undefined
  });
  if (!parsed.success) throw new Error("Invalid input");

  await connectDB();
  const trip = await Trip.findById(parsed.data.tripId);
  if (!trip || trip.clerkUserId !== userId) throw new Error("Forbidden");

  const { dayIndex, activityIndex, title, time, location, notes, cost } = parsed.data;
  const day = trip.days[dayIndex];
  if (!day?.activities[activityIndex]) {
    throw new Error("Activity not found");
  }

  const activity = day.activities[activityIndex];
  activity.title = title;
  if (time !== undefined) activity.time = time;
  if (location !== undefined) activity.location = location;
  if (notes !== undefined) activity.notes = notes;
  if (cost !== undefined) activity.cost = cost;
  
  trip.markModified(`days.${dayIndex}.activities`);
  await trip.save();
  revalidatePath(`/dashboard/${trip._id}`);
}

