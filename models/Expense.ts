import { Schema, model, models } from "mongoose";

export interface ExpenseDocument {
  _id: string;
  userId: string;
  amount: number;
  category: string;
  date: Date;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, maxlength: 50 },
    date: { type: Date, required: true },
    description: { type: String, trim: true, maxlength: 200 }
  },
  { timestamps: true }
);

// Optimize common queries and sorts
ExpenseSchema.index({ userId: 1, createdAt: -1 });
ExpenseSchema.index({ userId: 1, amount: 1 });

export const Expense =
  models.Expense || model<ExpenseDocument>("Expense", ExpenseSchema);

