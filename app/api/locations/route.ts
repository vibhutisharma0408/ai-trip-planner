import { NextRequest, NextResponse } from "next/server";

const popularDestinations = [
  "Paris, France",
  "London, UK",
  "New York, USA",
  "Tokyo, Japan",
  "Rome, Italy",
  "Barcelona, Spain",
  "Amsterdam, Netherlands",
  "Berlin, Germany",
  "Sydney, Australia",
  "Dubai, UAE",
  "Bangkok, Thailand",
  "Singapore",
  "Istanbul, Turkey",
  "Vienna, Austria",
  "Prague, Czech Republic",
  "Mumbai, India",
  "Delhi, India",
  "Goa, India",
  "Jaipur, India",
  "Agra, India",
  "Kerala, India",
  "Rajasthan, India",
  "Himachal Pradesh, India",
  "Uttarakhand, India",
  "Karnataka, India",
  "Tamil Nadu, India",
  "Maharashtra, India",
  "Gujarat, India",
  "Punjab, India",
  "Haryana, India"
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  const suggestions = popularDestinations
    .filter(dest => dest.toLowerCase().includes(query))
    .slice(0, 10);

  return NextResponse.json({ suggestions });
}