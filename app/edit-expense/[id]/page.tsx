import { SignedIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Navbar from "@/components/Navbar";
import ExpenseForm from "@/components/ExpenseForm";
import { connectDB } from "@/lib/db";
import { Expense } from "@/models/Expense";

export const dynamic = "force-dynamic";

async function getUserId(): Promise<string | null> {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-clerk-user-id");
    return userId;
  } catch {
    return null;
  }
}

export default async function EditExpensePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getUserId();
  if (!userId) redirect("/sign-in");

  await connectDB();
  const { id } = await params;
  const expense = await Expense.findOne({ _id: id, userId }).lean();
  if (!expense) redirect("/dashboard");

  return (
    <SignedIn>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <ExpenseForm
          expenseId={id}
          defaultValues={{
            amount: expense.amount,
            category: expense.category,
            date: new Date(expense.date).toISOString().split("T")[0],
            description: expense.description
          }}
        />
      </main>
    </SignedIn>
  );
}

