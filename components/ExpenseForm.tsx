"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1, "Category is required"),
  date: z.string(),
  description: z.string().min(1, "Description is required")
});

type FormValues = z.infer<typeof formSchema>;

export default function ExpenseForm({
  expenseId,
  defaultValues
}: {
  expenseId?: string;
  defaultValues?: Partial<FormValues>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: defaultValues?.amount ?? 0,
      category: defaultValues?.category ?? "",
      date: defaultValues?.date ?? new Date().toISOString().split("T")[0],
      description: defaultValues?.description ?? ""
    }
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const method = expenseId ? "PUT" : "POST";
      const url = expenseId ? `/api/expenses?id=${expenseId}` : "/api/expenses";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, amount: Number(values.amount) })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ? JSON.stringify(data.error) : "Request failed");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="card mx-auto max-w-xl space-y-4 p-6"
    >
      <h2 className="text-xl font-semibold">
        {expenseId ? "Edit Expense" : "Add Expense"}
      </h2>
      <div className="space-y-1">
        <label className="text-sm font-medium">Amount</label>
        <input
          type="number"
          step="0.01"
          className="w-full rounded-md border px-3 py-2 focus:border-blue-600 focus:outline-none"
          {...form.register("amount", { valueAsNumber: true })}
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Category</label>
        <input
          className="w-full rounded-md border px-3 py-2 focus:border-blue-600 focus:outline-none"
          placeholder="Food, Travel, Rent..."
          {...form.register("category")}
        />
        {form.formState.errors.category && (
          <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Date</label>
        <input
          type="date"
          className="w-full rounded-md border px-3 py-2 focus:border-blue-600 focus:outline-none"
          {...form.register("date")}
        />
        {form.formState.errors.date && (
          <p className="text-sm text-red-600">{form.formState.errors.date.message}</p>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Description</label>
        <textarea
          className="w-full rounded-md border px-3 py-2 focus:border-blue-600 focus:outline-none"
          {...form.register("description")}
          rows={3}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-600">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        {expenseId ? "Update" : "Create"} Expense
      </button>
    </form>
  );
}

