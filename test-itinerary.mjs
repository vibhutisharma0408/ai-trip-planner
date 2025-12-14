import { generateItinerary } from "./lib/ai.js";

async function testItinerary() {
  try {
    const result = await generateItinerary({
      destination: "Paris",
      startDate: "2024-12-11",
      endDate: "2024-12-18",
      travelerType: "solo"
    });

    console.log("Itinerary generated successfully!");
    console.log("Overview:", result.overview);
    console.log("Number of days:", result.days.length);
    console.log("Days:", result.days.map(d => d.date));
  } catch (error) {
    console.error("Error:", error);
  }
}

testItinerary();