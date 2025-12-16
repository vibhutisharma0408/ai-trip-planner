import { puter } from '@heyputer/puter.js';

// Initialize Puter with token if available
if (process.env.PUTER_TOKEN) {
  puter.setAuthToken(process.env.PUTER_TOKEN);
}

export async function generateItinerary({
  destination,
  startDate,
  endDate,
  travelerType,
  budget,
  travelers,
  notes,
  disableFallback
}: {
  destination: string;
  startDate: string;
  endDate: string;
  travelerType: string;
  budget?: number;
  travelers?: number;
  notes?: string;
  disableFallback?: boolean;
}) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Generate array of dates
  const dates = [];
  for (let i = 0; i < dayCount; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  try {
    const prompt = `You are an expert travel planner with access to real-time knowledge. Generate a detailed, realistic trip itinerary for:

Destination: ${destination}
Start Date: ${startDate}
End Date: ${endDate}
${budget ? `Budget: ₹${budget}` : ""}
${travelers ? `Travelers: ${travelers}` : ""}
Traveler Type: ${travelerType}
${notes ? `User Notes/Preferences: ${notes}` : ""}

**IMPORTANT: Generate exactly ${dayCount} days of activities, one for each day from ${startDate} to ${endDate}**

CRITICAL REQUIREMENTS:
1. You MUST create exactly ${dayCount} day objects in the "days" array
2. Each day must have a date from ${startDate} to ${endDate} (format: YYYY-MM-DD)
3. Use REAL, SPECIFIC places in ${destination} - no generic names
4. For major cities, include: famous landmarks, specific restaurants (with actual names), museums, markets, neighborhoods
5. For smaller destinations, research actual attractions, viewpoints, local spots
6. Each activity must have: title, time (HH:MM), location (specific address or landmark name), notes (booking info, duration, tips), cost (realistic INR estimate)
7. Respect the user's budget and notes in your recommendations.

Example of specific vs generic:
❌ Generic: "Visit local market", "Popular restaurant", "City landmarks"
✅ Specific: "Chandni Chowk Market", "Karim's Restaurant", "Red Fort"

Return ONLY valid JSON matching this exact structure (NO extra text):
{
  "overview": "Brief trip summary for ${travelerType} travelers",
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

    console.log("Sending request to Puter AI...");
    const response = await puter.ai.chat(prompt);
    console.log("Puter AI Response:", response);

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
      throw new Error("Unexpected response format from Puter AI: " + JSON.stringify(response));
    }

    // Clean any markdown formatting
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsedJson = JSON.parse(content);

    // Validate day count
    if (!parsedJson.days || parsedJson.days.length !== dayCount) {
      throw new Error(`AI generated ${parsedJson.days?.length || 0} days but expected ${dayCount}`);
    }

    return parsedJson;

  } catch (error: any) {
    console.error('AI generation failed:', error.message);

    if (disableFallback) {
      throw error;
    }

    // Fallback: Generate basic itinerary with all days
    console.log('Using fallback itinerary generation');

    const fallbackResult = {
      overview: `A ${dayCount}-day trip to ${destination} for ${travelerType} travelers`,
      days: dates.map(date => ({
        date,
        activities: [
          {
            title: `Explore ${destination}`,
            time: "10:00",
            location: "City center",
            notes: "Discover local attractions and landmarks",
            cost: 1000
          },
          {
            title: "Local dining experience",
            time: "19:00",
            location: "Popular restaurant area",
            notes: "Try regional cuisine",
            cost: 800
          }
        ]
      }))
    };

    return fallbackResult;
  }
}

export async function generateAdvice(expenses: any[]) {
  const systemPrompt = `You are a financial advisor specializing in travel budgeting. Analyze the user's recent expenses and provide practical advice on how to save money and optimize their spending during travel. Be specific, actionable, and realistic.`;

  const userPrompt = `Based on these recent expenses, provide budgeting advice for travel:

${expenses.map(exp => `- ${exp.category}: ₹${exp.amount} on ${exp.date} - ${exp.description}`).join('\n')}

Provide advice in this JSON format:
{
  "summary": "Brief overview of spending patterns",
  "savings": ["3-5 specific tips to save money"],
  "recommendations": ["2-3 spending optimizations"]
}`;

  const response = await puter.ai.chat(`${systemPrompt}\n\n${userPrompt}`);

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
  } else {
    content = JSON.stringify(response);
  }

  // Clean any markdown formatting
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  return JSON.parse(content);
}
