import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { generateAdvice } from "@/lib/ai";
import { Expense } from "@/models/Expense";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const recent = await Expense.find({ userId })
    .sort({ date: -1 })
    .limit(20)
    .lean();

  const advice = await generateAdvice(recent);
  return NextResponse.json(advice, { status: 200 });
}

