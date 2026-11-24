import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';

// "an account already exists" is a shared step defined in sign-up.steps.ts.
// "I am logged in with that account" is defined in manage-trip-budgets.steps.ts.
// "I have a trip" is defined in manage-budget-items.steps.ts.

const API_URL = process.env.API_URL || 'http://localhost:3000';

// ── Given ─────────────────────────────────────────────────────────────

Given(
  'the trip has a budget item in the category {string} with the amount {string}',
  async ({ request, scenario }, category: string, amount: string) => {
    // Precondition through the API: item creation is covered by the US-04 scenario.
    const response = await request.post(`${API_URL}/api/trips/${scenario.tripId}/items`, {
      headers: { Authorization: `Bearer ${scenario.token}` },
      data: { category, amount: Number(amount), description: `${category} item` },
    });
    expect(response.status()).toBe(201);
  },
);

// ── When ──────────────────────────────────────────────────────────────

When('I open the page of that trip', async ({ tripDetailPage, scenario }) => {
  await tripDetailPage.open(scenario.tripId!);
  await expect(
    tripDetailPage.heading(`Trip budget - ${scenario.trip!.cityFrom} - ${scenario.trip!.cityTo}`),
  ).toBeVisible();
});

// ── Then ──────────────────────────────────────────────────────────────

Then('the grand total is {string}', async ({ tripDetailPage }, total: string) => {
  await expect(tripDetailPage.grandTotalCard).toContainText(total);
});

Then(
  'the total of the category {string} is {string}',
  async ({ tripDetailPage }, category: string, total: string) => {
    await expect(tripDetailPage.categoryTotal(category)).toContainText(total);
  },
);

Then(
  'the daily budget is {string} per day, {string} over 6 days',
  async ({ tripDetailPage }, perDay: string, total: string) => {
    await expect(tripDetailPage.dailyBudgetCard).toContainText(`${perDay} per day`);
    await expect(tripDetailPage.dailyBudgetCard).toContainText(`${total} over 6 days`);
  },
);
