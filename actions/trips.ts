"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Trip } from "@/models/Trip";
import { generateItinerary } from "@/lib/ai";

// Note: headers() must be called directly in server actions, not in helper functions

const tripInputSchema = z.object({
  destination: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  budget: z.number().optional(),
  travelers: z.number().optional(),
  style: z.string().optional(),
  notes: z.string().optional(),
  strictAI: z.boolean().optional(),
  preGeneratedItinerary: z.string().optional()
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
    const headersList = await headers();
    const userId = headersList.get("x-clerk-user-id");
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
      notes: formData.get("notes")?.toString(),
      strictAI: formData.get("strictAI") === "on",
      preGeneratedItinerary: formData.get("preGeneratedItinerary")?.toString()
    });

    if (!parsed.success) {
      return { error: "Invalid input: " + parsed.error.message };
    }

    // Create a minimal trip immediately so we can return fast
    await connectDB();
    const created = await Trip.create({
      destination: parsed.data.destination,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      ...(parsed.data.budget ? { budget: parsed.data.budget } : {}),
      ...(parsed.data.travelers ? { travelers: parsed.data.travelers } : {}),
      ...(parsed.data.style ? { style: parsed.data.style } : {}),
      ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
      days: [],
      clerkUserId: userId
    });

    // Helper to build a minimal, deterministic fallback itinerary if AI is unavailable
    const buildFallback = () => {
      const start = new Date(parsed.data.startDate);
      const end = new Date(parsed.data.endDate);
      const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Generate array of dates
      const dates = [];
      for (let i = 0; i < dayCount; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }

      return {
        destination: parsed.data.destination,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
        ...(parsed.data.budget ? { budget: parsed.data.budget } : {}),
        ...(parsed.data.travelers ? { travelers: parsed.data.travelers } : {}),
        ...(parsed.data.style ? { style: parsed.data.style } : {}),
        ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
        days: dates.map((date, index) => ({
          date,
          activities: [
            {
              title: index === 0 ? "Arrival & Check-in" : `Day ${index + 1} exploration`,
              time: index === 0 ? "09:00" : "10:00",
              location: index === 0 ? "Hotel lobby" : "City center",
              notes: index === 0 ? "Check in, drop luggage, quick breakfast nearby" : "Discover local attractions and landmarks",
              cost: index === 0 ? 500 : 1000
            },
            {
              title: index === 0 ? "Local sightseeing" : "Local dining experience",
              time: index === 0 ? "12:00" : "19:00",
              location: index === 0 ? "City center landmarks" : "Popular restaurant area",
              notes: index === 0 ? "Walkable highlights tour and photo stops" : "Try regional cuisine",
              cost: index === 0 ? 200 : 800
            }
          ]
        }))
      };
    };



    let validated: z.infer<typeof tripSchema>;

    async function tryGenerateViaAI(): Promise<z.infer<typeof tripSchema>> {
      const itinerary = await generateItinerary({
        destination: parsed.data.destination,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
        travelerType: parsed.data.style || "general",
        budget: parsed.data.budget,
        travelers: parsed.data.travelers,
        notes: parsed.data.notes,
        disableFallback: parsed.data.strictAI
      });

      console.log(itinerary);

      return {
        destination: parsed.data.destination,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
        budget: parsed.data.budget,
        travelers: parsed.data.travelers,
        style: parsed.data.style,
        notes: (parsed.data.notes ? parsed.data.notes + "\n\n" : "") + itinerary.overview,
        days: itinerary.days
      };
    }

    // Generate itinerary
    try {
      if (parsed.data.preGeneratedItinerary) {
        const preGenerated = JSON.parse(parsed.data.preGeneratedItinerary);
        validated = {
          destination: parsed.data.destination,
          startDate: parsed.data.startDate,
          endDate: parsed.data.endDate,
          budget: parsed.data.budget,
          travelers: parsed.data.travelers,
          style: parsed.data.style,
          notes: (parsed.data.notes ? parsed.data.notes + "\n\n" : "") + preGenerated.overview,
          days: preGenerated.days
        };
      } else {
        validated = await tryGenerateViaAI();
      }
    } catch (error) {
      if (parsed.data.strictAI) {
        throw error; // Re-throw if strict mode is on
      }
      try {
        validated = await tryGenerateViaAI();
      } catch {
        validated = tripSchema.parse(buildFallback());
      }
    }

    // Update the trip with the generated itinerary
    await Trip.findByIdAndUpdate(created._id, {
      destination: validated.destination,
      startDate: validated.startDate,
      endDate: validated.endDate,
      budget: validated.budget,
      travelers: validated.travelers,
      style: validated.style,
      notes: validated.notes,
      days: validated.days
    });

    revalidatePath("/dashboard");
    // Return only minimal, fully-serializable data to the client (client will redirect)
    return { tripId: created._id.toString() };
  } catch (error: any) {
    // Better error handling with more specific messages
    let errorMessage = "Failed to create trip";

    if (error?.message) {
      if (error.message.includes("NO_AI_KEY")) {
        errorMessage = "AI API key is missing. Please configure AI_API_KEY.";
      } else if (error.message.includes("AI_TIMEOUT") || error.message.includes("NO_CONTENT")) {
        // AI failed, but we should have already used fallback in the try block
        // If we get here, it means fallback also failed
        errorMessage = "AI generation failed. Please try again.";
      } else if (error.message.includes("Unauthorized")) {
        errorMessage = "You must be signed in to create a trip.";
      } else if (error.message.includes("MONGODB_URI")) {
        errorMessage = "Database connection error. Please try again.";
      } else if (error.message.includes("bad auth") || error.message.includes("Authentication failed")) {
        errorMessage = "Database authentication failed. Please check your MONGODB_URI credentials.";
      } else {
        errorMessage = error.message;
      }
    }

    return { error: errorMessage };
  }
}

export async function deleteTripAction(formData: FormData) {
  const headersList = await headers();
  const userId = headersList.get("x-clerk-user-id");
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
  const headersList = await headers();
  const userId = headersList.get("x-clerk-user-id");
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

