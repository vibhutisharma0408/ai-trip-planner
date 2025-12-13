"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ExpenseDocument } from "@/models/Expense";

interface Props {
  expenses: ExpenseDocument[];
}

export default function ExpenseList({ expenses }: Props) {
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState<"recent" | "amount">("recent");

  const filtered = useMemo(() => {
    let list = [...expenses];
    if (category) list = list.filter((e) => e.category === category);
    if (date) list = list.filter((e) => new Date(e.date) >= new Date(date));
    if (sort === "amount") list.sort((a, b) => a.amount - b.amount);
    else list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return list;
  }, [category, date, sort, expenses]);

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Delete this expense?");
    if (!confirmed) return;
    await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
    window.location.reload();
  };

  const categories = Array.from(new Set(expenses.map((e) => e.category)));

  return (
    <div className="card mt-4 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-sm font-medium">Filter by Category</label>
          <select
            className="mt-1 w-48 rounded-md border px-3 py-2 focus:border-blue-600 focus:outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">From Date</label>
          <input
            type="date"
            className="mt-1 rounded-md border px-3 py-2 focus:border-blue-600 focus:outline-none"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Sort</label>
          <select
            className="mt-1 rounded-md border px-3 py-2 focus:border-blue-600 focus:outline-none"
            value={sort}
            onChange={(e) => setSort(e.target.value as "recent" | "amount")}
          >
            <option value="recent">Most Recent</option>
            <option value="amount">Amount</option>
          </select>
        </div>
      </div>

      <ul className="mt-4 divide-y">
        {filtered.map((expense) => (
          <li key={expense._id.toString()} className="flex items-center justify-between py-3">
            <div>
              <p className="font-semibold">
                ₹{expense.amount.toFixed(2)} • {expense.category}
              </p>
              <p className="text-sm text-slate-600">
                {new Date(expense.date).toLocaleDateString()} — {expense.description}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/edit-expense/${expense._id.toString()}`}
                className="rounded-md border px-3 py-2 text-sm hover:bg-slate-100"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(expense._id.toString())}
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

