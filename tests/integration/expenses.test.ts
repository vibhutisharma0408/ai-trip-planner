/**
 * Minimal integration tests for /api/expenses route.
 * Uses mongodb-memory-server and mocks Clerk auth.
 */
import { jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import * as clerk from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Expense } from "@/models/Expense";
import { GET, POST, PUT, DELETE } from "@/app/api/expenses/route";

jest.mock("@clerk/nextjs/server");

describe("/api/expenses", () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri();
    (clerk.auth as jest.Mock).mockReturnValue({ userId: "user_1" });
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it("creates and returns expenses", async () => {
    const req = new NextRequest("http://localhost/api/expenses", {
      method: "POST",
      body: JSON.stringify({
        amount: 50,
        category: "Food",
        date: new Date().toISOString(),
        description: "Lunch"
      }),
      headers: { "Content-Type": "application/json", "x-clerk-user-id": "user_1" }
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const getRes = await GET(new NextRequest("http://localhost/api/expenses", {
      headers: { "x-clerk-user-id": "user_1" }
    }));
    const data = await getRes.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].category).toBe("Food");
  });

  it("updates an expense", async () => {
    const expense = await Expense.create({
      userId: "user_1",
      amount: 20,
      category: "Travel",
      date: new Date(),
      description: "Bus"
    });

    const req = new NextRequest(`http://localhost/api/expenses?id=${expense._id}`, {
      method: "PUT",
      body: JSON.stringify({
        amount: 30,
        category: "Travel",
        date: new Date().toISOString(),
        description: "Taxi"
      }),
      headers: { "Content-Type": "application/json", "x-clerk-user-id": "user_1" }
    });

    const res = await PUT(req);
    expect(res.status).toBe(200);
    const updated = await Expense.findById(expense._id);
    expect(updated?.description).toBe("Taxi");
  });

  it("deletes an expense", async () => {
    const expense = await Expense.create({
      userId: "user_1",
      amount: 10,
      category: "Misc",
      date: new Date(),
      description: "Pen"
    });

    const res = await DELETE(
      new NextRequest(`http://localhost/api/expenses?id=${expense._id}`, {
        method: "DELETE",
        headers: { "x-clerk-user-id": "user_1" }
      })
    );
    expect(res.status).toBe(200);
    const found = await Expense.findById(expense._id);
    expect(found).toBeNull();
  });
});

