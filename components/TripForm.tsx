"use client";
import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTripAction } from "@/actions/trips";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { puter } from '@heyputer/puter.js';

export default function TripForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [puterUser, setPuterUser] = useState<string | null>(null);

  useEffect(() => {
    // Check if already signed in to Puter
    if (puter.auth.isSignedIn()) {
      puter.auth.getUser().then(user => setPuterUser(user.username));
    }

    if (destination.length > 1) {
      fetch(`/api/locations?q=${encodeURIComponent(destination)}`)
        .then(res => res.json())
        .then(data => setSuggestions(data.suggestions))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [destination]);

  const handlePuterSignIn = async () => {
    try {
      await puter.auth.signIn();
      const user = await puter.auth.getUser();
      setPuterUser(user.username);
    } catch (error) {
      console.error('Puter Sign-in failed:', error);
      setError("Failed to sign in to Puter");
    }
  };

  async function generateClientSideItinerary(formData: FormData) {
    const dest = formData.get("destination")?.toString() || "";
    const start = new Date(formData.get("startDate")?.toString() || "");
    const end = new Date(formData.get("endDate")?.toString() || "");
    const budget = formData.get("budget");
    const travelers = formData.get("travelers");
    const style = formData.get("style");
    const notes = formData.get("notes");

    const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Generate array of dates
    const dates = [];
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const prompt = `You are an expert travel planner with access to real-time knowledge. Generate a detailed, realistic trip itinerary for:

Destination: ${dest}
Start Date: ${formData.get("startDate")}
End Date: ${formData.get("endDate")}
${budget ? `Budget: ₹${budget}` : ""}
${travelers ? `Travelers: ${travelers}` : ""}
Traveler Type: ${style || "general"}
${notes ? `User Notes/Preferences: ${notes}` : ""}

**IMPORTANT: Generate exactly ${dayCount} days of activities, one for each day from ${formData.get("startDate")} to ${formData.get("endDate")}**

CRITICAL REQUIREMENTS:
1. You MUST create exactly ${dayCount} day objects in the "days" array
2. Each day must have a date from ${formData.get("startDate")} to ${formData.get("endDate")} (format: YYYY-MM-DD)
3. Use REAL, SPECIFIC places in ${dest} - no generic names
4. For major cities, include: famous landmarks, specific restaurants (with actual names), museums, markets, neighborhoods
5. For smaller destinations, research actual attractions, viewpoints, local spots
6. Each activity must have: title, time (HH:MM), location (specific address or landmark name), notes (booking info, duration, tips), cost (realistic INR estimate)
7. Respect the user's budget and notes in your recommendations.

Example of specific vs generic:
❌ Generic: "Visit local market", "Popular restaurant", "City landmarks"
✅ Specific: "Chandni Chowk Market", "Karim's Restaurant", "Red Fort"

Return ONLY valid JSON matching this exact structure (NO extra text):
{
  "overview": "Brief trip summary for ${style || "general"} travelers",
  "days": [
${dates.map((date, index) =>
      `    {
      "date": "${date}",
      "activities": [
        {
          "title": "Specific attraction/activity name",
          "time": "HH:MM",
          "location": "Specific location/address",
          "notes": "Practical tips, booking info, duration",
          "cost": 1000
        }
      ]
    }${index < dates.length - 1 ? ',' : ''}`
    ).join('\n')}
  ]
}`;

    console.log("Generating itinerary via Puter client-side...");
    const response = await puter.ai.chat(prompt, { model: 'gemini-2.0-flash' });

    let content = "";
    if (typeof response === 'string') {
      content = response;
    } else if (response?.message?.content) {
      const msgContent = response.message.content;
      if (typeof msgContent === 'string') {
        content = msgContent;
      } else if (Array.isArray(msgContent)) {
        content = msgContent.map((part: any) => part.text || part).join('');
      } else {
        content = String(msgContent);
      }
    } else if (response?.message) {
      content = String(response.message);
    } else {
      throw new Error("Unexpected response format from Puter AI");
    }

    // Clean markdown
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return content;
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setRedirecting(false);

    try {
      // If signed in to Puter, try client-side generation first
      if (puterUser) {
        try {
          const itineraryJson = await generateClientSideItinerary(formData);
          formData.append("preGeneratedItinerary", itineraryJson);
        } catch (err) {
          console.error("Client-side AI failed, falling back to server:", err);
          // If strict mode is on, we might want to stop here, but for now let's fallback to server
          // unless the user explicitly wanted ONLY client side. 
          // The server action also has strict mode logic.
        }
      }

      // Add timeout wrapper for the server action
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Please try again.")), 60000)
      );

      const result = await Promise.race([
        createTripAction(formData),
        timeoutPromise
      ]) as { error?: string; tripId?: string } | null;

      if (!result) {
        setError("No response from server. Please try again.");
        setLoading(false);
        return;
      }

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.tripId) {
        // Clear errors and show redirecting state
        setError(null);
        setRedirecting(true);
        setLoading(false);

        const redirectUrl = `/dashboard/${result.tripId}?created=1`;

        // Force immediate hard redirect - this will stop all execution
        // Use replace to avoid back button issues and prevent crashes
        window.location.replace(redirectUrl);

        // This should never execute, but just in case:
        return;
      }

      // No tripId in result
      setError("Failed to create trip - no trip ID returned");
      setLoading(false);
    } catch (err: any) {
      // Better error handling
      const errorMessage = err?.message || "Failed to create trip";

      // Check for specific error types
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        setError("Network error. Please check your connection and try again.");
      } else if (errorMessage.includes("timed out")) {
        setError("Request timed out. The itinerary generation is taking longer than expected. Please try again.");
      } else {
        setError(errorMessage);
      }

      setLoading(false);
      setRedirecting(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Don't await - let redirect happen immediately
    handleSubmit(fd).catch((err) => {
      console.error("Submit error:", err);
      setError(err?.message || "Failed to submit");
      setLoading(false);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex justify-end mb-4">
        {puterUser ? (
          <div className="text-sm text-green-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Connected to Puter as {puterUser}
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePuterSignIn}
            className="text-xs"
          >
            Sign in with Puter.com (for faster AI)
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <div className="relative">
            <Input
              id="destination"
              name="destination"
              placeholder="e.g., Paris, France"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setDestination(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
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

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="strictAI"
          name="strictAI"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <Label htmlFor="strictAI" className="font-normal text-slate-600">
          Strict AI Mode 
        </Label>
      </div>

      {loading && !redirecting && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" role="status" aria-live="polite">
          Generating itinerary{puterUser ? " with Puter AI" : ""}. This can take up to 2–3 minutes. Please keep this tab open.
        </div>
      )}
      {redirecting && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700" role="status" aria-live="polite">
          ✓ Itinerary created successfully! Redirecting to your trip...
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









