import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ActivitySchema = new Schema(
  {
    title: { type: String, required: true },
    time: { type: String },
    location: { type: String },
    notes: { type: String },
    cost: { type: Number }
  },
  { _id: false }
);

const DaySchema = new Schema(
  {
    date: { type: String, required: true },
    activities: { type: [ActivitySchema], default: [] }
  },
  { _id: false }
);

const TripSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    destination: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    budget: { type: Number },
    travelers: { type: Number },
    style: { type: String },
    notes: { type: String },
    days: { type: [DaySchema], default: [] }
  },
  {
    timestamps: true
  }
);

// Optimize common dashboard query: find by user then sort by createdAt
TripSchema.index({ clerkUserId: 1, createdAt: -1 });

export type TripDocument = InferSchemaType<typeof TripSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Trip: Model<TripDocument> =
  mongoose.models.Trip || mongoose.model("Trip", TripSchema);

