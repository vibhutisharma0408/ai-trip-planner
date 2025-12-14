import 'dotenv/config';
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY
});

async function testAI() {
  const destination = "Paris";
  const startDate = "2024-12-11";
  const endDate = "2024-12-18";
  const travelerType = "solo";

  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const dates = [];
  for (let i = 0; i < daysCount; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  console.log(`Expected days: ${daysCount}`);
  console.log(`Dates: ${dates.join(', ')}`);

  const systemPrompt = `You are an expert travel planner with strict guidelines to ensure realistic, accurate, and fact-based itineraries. Follow these rules exactly:

1. Only use REAL locations, famous attractions, and places verified by actual travel data. Do not invent places. Examples: For Paris - Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, Seine River. For Mumbai - Gateway of India, Marine Drive, Elephanta Caves, Chowpatty Beach. For Delhi - Red Fort, India Gate, Chandni Chowk, Connaught Place.
2. Provide realistic hotel price ranges based on actual data for the destination (e.g., Paris: €70–€200/night, converted to INR if needed).
3. Each day must include 4–7 logical activities with accurate travel flow and realistic times.
4. Avoid filler text like "drop luggage", "quick breakfast nearby", "check-in", "lobby", etc. Start directly with meaningful activities.
5. Do NOT invent cheap unrealistic prices (e.g., no ₹500 hotel in Paris).
6. Do NOT invent places that are not real.
7. The itinerary should be based on the exact day count: number of days = endDate - startDate + 1.
8. Include: Overview, Day-wise plan, Travel times, Realistic meals (well-known food spots only), Realistic hotel options.
9. Absolutely avoid hallucinations. If unsure about any detail, ask the user for clarification.
10. Output must be structured JSON only, no extra text.
11. IMPORTANT: Generate exactly the number of days specified in the user prompt, with one entry for each date listed.`;

  const userPrompt = `Generate a realistic itinerary for ${travelerType} travelers to ${destination} from ${startDate} to ${endDate} (${daysCount} days total).

CRITICAL REQUIREMENTS:
- You MUST generate exactly ${daysCount} days
- Each day MUST have a unique date from this list: ${dates.join(', ')}
- Do NOT generate fewer or more days than ${daysCount}

For each of these ${daysCount} dates, create activities:
${dates.map((date, index) => `Day ${index + 1} (${date}): 4-7 activities with time, location, notes, realistic INR cost`).join('\n')}

Output ONLY this JSON structure:
{
  "overview": "Brief trip summary",
  "days": [
${dates.map(date => `    {"date": "${date}", "activities": [{"title": "Activity name", "time": "HH:MM", "location": "Real place name", "notes": "Description", "cost": 1000}]}`).join(',\n')}
  ]
}`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No response from AI");

    const result = JSON.parse(content);

    console.log(`AI generated ${result.days?.length || 0} days`);
    console.log('Success:', result.days?.length === daysCount);

    if (result.days?.length !== daysCount) {
      console.error('AI Response:', content);
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

testAI();