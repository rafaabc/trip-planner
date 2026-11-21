import { expect } from '@playwright/test';
import { Given, When } from './fixtures';

// "an account already exists", "I am taken to the dashboard" and "I am logged in" are shared
// steps defined in sign-up.steps.ts.

Given('I am on the Log in page', async ({ loginPage }) => {
  await loginPage.open();
  await expect(loginPage.heading).toBeVisible();
});

When('I log in with that account', async ({ loginPage, scenario }) => {
  await loginPage.logIn(scenario.account!);
});
