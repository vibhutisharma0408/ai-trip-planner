import { test, expect } from "@playwright/test";

const clerkEmail = process.env.E2E_CLERK_EMAIL;
const clerkPassword = process.env.E2E_CLERK_PASSWORD;

test.describe("Expense tracker happy path", () => {
  test.skip(!clerkEmail || !clerkPassword, "Provide Clerk creds to run E2E");

  test("sign up, add, edit, get AI advice, logout", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByLabel("Email address").fill(clerkEmail!);
    await page.getByLabel("Password", { exact: false }).fill(clerkPassword!);
    await page.getByRole("button", { name: /continue/i }).click();

    await page.goto("/dashboard");
    await expect(page.getByText("AI Expense Tracker")).toBeVisible();

    await page.goto("/add-expense");
    await page.getByLabel("Amount").fill("45");
    await page.getByLabel("Category").fill("Food");
    await page.getByLabel("Date").fill("2024-01-10");
    await page.getByLabel("Description").fill("Dinner");
    await page.getByRole("button", { name: /create/i }).click();

    await page.waitForURL("/dashboard");
    await expect(page.getByText("Food")).toBeVisible();

    await page.getByRole("link", { name: /edit/i }).first().click();
    await page.waitForURL(/edit-expense/);
    await page.getByLabel("Description").fill("Dinner with friends");
    await page.getByRole("button", { name: /update/i }).click();

    await page.waitForURL("/dashboard");
    await expect(page.getByText("Dinner with friends")).toBeVisible();

    await page.getByText("AI Advice").scrollIntoViewIfNeeded();
    await expect(page.getByText("Highest")).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/sign-in/);
  });
});

