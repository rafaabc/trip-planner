import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import { newTrip } from '../support/test-data';

// "an account already exists" is a shared step defined in sign-up.steps.ts.

const API_URL = process.env.API_URL || 'http://localhost:3000';

// ── Given ─────────────────────────────────────────────────────────────

Given('I am logged in with that account', async ({ page, request, scenario }) => {
  // Precondition through the API: the login form is already covered by the US-02 scenario.
  // The session is stored the same way the app does it, before any page loads.
  const response = await request.post(`${API_URL}/api/auth/login`, {
    data: { email: scenario.account!.email, password: scenario.account!.password },
  });
  expect(response.status()).toBe(200);
  const { token, user } = await response.json();
  await page.addInitScript(
    ({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    { token, user },
  );
});

Given('I am on the Trips page', async ({ tripsPage }) => {
  await tripsPage.open();
  await expect(tripsPage.heading).toBeVisible();
});

// ── When ──────────────────────────────────────────────────────────────

When(
  'I create a trip from {string} to {string} from {string} to {string}',
  async (
    { tripsPage, scenario },
    cityFrom: string,
    cityTo: string,
    startDate: string,
    endDate: string,
  ) => {
    scenario.trip = newTrip({ cityFrom, cityTo, startDate, endDate });
    await tripsPage.createTrip(scenario.trip);
  },
);

// ── Then ──────────────────────────────────────────────────────────────

Then('the trip {string} is listed', async ({ tripsPage }, title: string) => {
  await expect(tripsPage.tripEntry(title)).toBeVisible();
});

Then(
  'the trip is shown with the dates {string}',
  async ({ tripsPage, scenario }, dates: string) => {
    const title = `Trip budget - ${scenario.trip!.cityFrom} - ${scenario.trip!.cityTo}`;
    await expect(tripsPage.tripEntry(title)).toContainText(dates);
  },
);
