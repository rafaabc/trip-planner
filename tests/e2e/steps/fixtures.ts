import { test as base, createBdd } from 'playwright-bdd';
import { SignUpPage } from '../pages/SignUpPage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { TripsPage } from '../pages/TripsPage';
import type { Account, TripDetails } from '../support/test-data';

interface Fixtures {
  tripsPage: TripsPage;
  signUpPage: SignUpPage;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  // Data shared between the steps of one scenario (each scenario gets its own copy)
  scenario: { account?: Account; trip?: TripDetails };
}

export const test = base.extend<Fixtures>({
  tripsPage: async ({ page }, use) => {
    await use(new TripsPage(page));
  },
  signUpPage: async ({ page }, use) => {
    await use(new SignUpPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  scenario: async ({}, use) => {
    await use({});
  },
});

export const { Given, When, Then } = createBdd(test);
