import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import { newTrip } from '../support/test-data';

// "an account already exists" is a shared step defined in sign-up.steps.ts.

// ── Given ─────────────────────────────────────────────────────────────

Given('I am logged in with that account', async ({ page, loginPage, dashboardPage, scenario }) => {
  await loginPage.open();
  await loginPage.logIn(scenario.account!);
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(dashboardPage.logoutButton).toBeVisible();
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
