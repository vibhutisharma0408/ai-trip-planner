import { generateItinerary } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await generateItinerary({
      destination: "Paris",
      startDate: "2024-12-11",
      endDate: "2024-12-18",
      travelerType: "solo"
    });

    return NextResponse.json({
      success: true,
      daysGenerated: result.days?.length || 0,
      expectedDays: 8,
      result
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}