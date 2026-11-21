import { test as base, createBdd } from 'playwright-bdd';
import { SignUpPage } from '../pages/SignUpPage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import type { Account } from '../support/test-data';

interface Fixtures {
  signUpPage: SignUpPage;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  // Data shared between the steps of one scenario (each scenario gets its own copy)
  scenario: { account?: Account };
}

export const test = base.extend<Fixtures>({
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
