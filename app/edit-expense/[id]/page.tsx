import { SignedIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ExpenseForm from "@/components/ExpenseForm";
import { connectDB } from "@/lib/db";
import { Expense } from "@/models/Expense";

interface Props {
  params: { id: string };
}

export default async function EditExpensePage({ params }: Props) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  await connectDB();
  const expense = await Expense.findOne({ _id: params.id, userId }).lean();
  if (!expense) redirect("/dashboard");

  return (
    <SignedIn>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <ExpenseForm
          expenseId={params.id}
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

