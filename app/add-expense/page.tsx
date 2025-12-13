import { SignedIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Navbar from "@/components/Navbar";
import ExpenseForm from "@/components/ExpenseForm";

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

export default async function AddExpensePage() {
  const userId = await getUserId();
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

