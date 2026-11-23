import { test as base, createBdd } from 'playwright-bdd';
import { SignUpPage } from '../pages/SignUpPage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { TripsPage } from '../pages/TripsPage';
import { TripDetailPage } from '../pages/TripDetailPage';
import type { Account, ItemDetails, TripDetails } from '../support/test-data';

interface Fixtures {
  tripsPage: TripsPage;
  tripDetailPage: TripDetailPage;
  signUpPage: SignUpPage;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  // Data shared between the steps of one scenario (each scenario gets its own copy)
  scenario: {
    account?: Account;
    token?: string;
    trip?: TripDetails;
    tripId?: number;
    item?: ItemDetails;
  };
}

export const test = base.extend<Fixtures>({
  tripsPage: async ({ page }, use) => {
    await use(new TripsPage(page));
  },
  tripDetailPage: async ({ page }, use) => {
    await use(new TripDetailPage(page));
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
