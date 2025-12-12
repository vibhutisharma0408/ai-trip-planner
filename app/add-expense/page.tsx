import { SignedIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ExpenseForm from "@/components/ExpenseForm";

export default function AddExpensePage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  return (
    <SignedIn>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <ExpenseForm />
      </main>
    </SignedIn>
  );
}

