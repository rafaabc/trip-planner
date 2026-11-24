import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import { newItem, newTrip } from '../support/test-data';

// "an account already exists" is a shared step defined in sign-up.steps.ts.
// "I am logged in with that account" is defined in manage-trip-budgets.steps.ts.

const API_URL = process.env.API_URL || 'http://localhost:3000';

// ── Given ─────────────────────────────────────────────────────────────

Given('I have a trip', async ({ request, scenario }) => {
  // Precondition through the API: trip creation is covered by the US-03 scenario.
  scenario.trip = newTrip();
  const response = await request.post(`${API_URL}/api/trips`, {
    headers: { Authorization: `Bearer ${scenario.token}` },
    data: scenario.trip,
  });
  expect(response.status(), await response.text()).toBe(201);
  scenario.tripId = (await response.json()).id;
});

Given('I am on the page of that trip', async ({ tripDetailPage, scenario }) => {
  await tripDetailPage.open(scenario.tripId!);
  await expect(
    tripDetailPage.heading(`Trip budget - ${scenario.trip!.cityFrom} - ${scenario.trip!.cityTo}`),
  ).toBeVisible();
});

// ── When ──────────────────────────────────────────────────────────────

When(
  'I add a budget item in the category {string} with the amount {string} and the description {string}',
  async ({ tripDetailPage, scenario }, category: string, amount: string, description: string) => {
    scenario.item = newItem({ category, amount, description });
    await tripDetailPage.addItem(scenario.item);
  },
);

// ── Then ──────────────────────────────────────────────────────────────

Then('the budget item {string} is listed', async ({ tripDetailPage }, description: string) => {
  await expect(tripDetailPage.itemRow(description)).toBeVisible();
});

Then(
  'the budget item is shown with the category {string} and the amount {string}',
  async ({ tripDetailPage, scenario }, category: string, amount: string) => {
    const row = tripDetailPage.itemRow(scenario.item!.description);
    await expect(row).toContainText(category);
    await expect(row).toContainText(amount);
  },
);
