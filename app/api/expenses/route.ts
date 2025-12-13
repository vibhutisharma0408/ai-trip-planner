import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { sanitizeString } from "@/lib/sanitize";
import { Expense } from "@/models/Expense";

const expenseSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1).max(50),
  date: z.string().transform((d) => new Date(d)),
  description: z.string().min(1).max(200)
});

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-clerk-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const date = searchParams.get("date");
  const sort = searchParams.get("sort");

  await connectDB();

  const query: Record<string, unknown> = { userId };
  if (category) query.category = category;
  if (date) query.date = { $gte: new Date(date) };

  const sortOption = sort === "amount" ? { amount: 1 } : { createdAt: -1 };
  const expenses = await Expense.find(query).sort(sortOption).lean();

  return NextResponse.json(expenses, { status: 200 });
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-clerk-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await req.json();
  const parsed = expenseSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();
  const sanitized = {
    ...parsed.data,
    description: sanitizeString(parsed.data.description),
    category: sanitizeString(parsed.data.category),
    userId
  };

  const expense = await Expense.create(sanitized);
  return NextResponse.json(expense, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const userId = req.headers.get("x-clerk-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const payload = await req.json();
  const parsed = expenseSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();
  const found = await Expense.findOne({ _id: id, userId });
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });

  found.amount = parsed.data.amount;
  found.category = sanitizeString(parsed.data.category);
  found.date = parsed.data.date;
  found.description = sanitizeString(parsed.data.description);
  await found.save();

  return NextResponse.json(found, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  const userId = req.headers.get("x-clerk-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await connectDB();
  const deleted = await Expense.findOneAndDelete({ _id: id, userId });
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true }, { status: 200 });
}

