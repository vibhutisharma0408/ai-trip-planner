import OpenAI from "openai";
import { ExpenseDocument } from "@/models/Expense";

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY
});

export async function generateAdvice(expenses: ExpenseDocument[]) {
  if (!client.apiKey) {
    return {
      highestCategory: "N/A",
      suggestion: "AI key missing, add AI_API_KEY to enable advice.",
      summary: "Unable to generate advice without API key."
    };
  }

  const sorted = [...expenses].sort((a, b) => b.amount - a.amount);
  const highestCategory = sorted[0]?.category ?? "N/A";

  const prompt = `
You are a concise spending assistant. Given recent expenses, return:
- Highest spending category
- One savings suggestion with an estimated amount
- A short spending pattern summary

Expenses:
${expenses
  .map(
    (e) =>
      `Category: ${e.category}, Amount: ${e.amount}, Date: ${new Date(e.date).toDateString()}, Description: ${e.description}`
  )
  .join("\n")}
`;

  try {
    const completion = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt
    });

    const text = completion.output_text ?? "";
    // Return simple structured data; if the model fails, fall back to defaults
    return {
      highestCategory,
      suggestion: text || "Consider reducing variable expenses to save monthly.",
      summary: `Your highest category is ${highestCategory}.`
    };
  } catch (err) {
    // Gracefully degrade if the AI provider errors out
    return {
      highestCategory,
      suggestion:
        "AI service is temporarily unavailable. Consider reducing variable expenses to save monthly.",
      summary: `Your highest category is ${highestCategory}.`
    };
  }
}

