import { generateItinerary } from "@/lib/ai";

// Mock OpenAI
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  overview: "Test overview",
                  days: [
                    {
                      date: "2024-12-11",
                      activities: [
                        {
                          title: "Visit Taj Mahal",
                          time: "09:00",
                          location: "Agra",
                          notes: "Iconic monument",
                          cost: 1000
                        }
                      ]
                    },
                    {
                      date: "2024-12-12",
                      activities: [
                        {
                          title: "Explore Red Fort",
                          time: "10:00",
                          location: "Delhi",
                          notes: "Historical site",
                          cost: 500
                        }
                      ]
                    }
                  ]
                })
              }
            }]
          })
        }
      }
    }))
  };
});

describe("generateItinerary", () => {
  it("generates itinerary with correct number of days", async () => {
    const result = await generateItinerary({
      destination: "India",
      startDate: "2024-12-11",
      endDate: "2024-12-18",
      travelerType: "solo"
    });

    expect(result).toHaveProperty("overview");
    expect(result.days).toHaveLength(8); // Should be 8 days for 11-18 Dec
    expect(result.days[0]).toHaveProperty("date", "2024-12-11");
    expect(result.days[0]).toHaveProperty("activities");
    expect(result.days[0].activities).toBeInstanceOf(Array);
  });
});