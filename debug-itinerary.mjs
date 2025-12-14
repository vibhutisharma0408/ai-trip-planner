import { generateItinerary } from "./lib/ai.js";

async function testItinerary() {
  try {
    console.log("Testing itinerary generation...");
    const result = await generateItinerary({
      destination: "Paris",
      startDate: "2024-12-11",
      endDate: "2024-12-18",
      travelerType: "solo"
    });

    console.log("Itinerary generated successfully!");
    console.log("Overview:", result.overview);
    console.log("Number of days:", result.days.length);
    console.log("Expected: 8 days");
    console.log("Days:", result.days.map(d => d.date));
    console.log("First day activities:", result.days[0]?.activities?.length || 0);
    console.log("Last day activities:", result.days[result.days.length - 1]?.activities?.length || 0);
  } catch (error) {
    console.error("Error:", error);
  }
}

testItinerary();