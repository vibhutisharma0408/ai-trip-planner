import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

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

export type ExpenseDocument = InferSchemaType<typeof ExpenseSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Expense: Model<ExpenseDocument> =
  (mongoose.models.Expense as Model<ExpenseDocument>) ||
  mongoose.model<ExpenseDocument>("Expense", ExpenseSchema);

