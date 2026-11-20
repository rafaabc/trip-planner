import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import { newAccount } from '../support/test-data';
import type { SignUpField } from '../pages/SignUpPage';

const API_URL = process.env.API_URL || 'http://localhost:3000';

// ── Given ─────────────────────────────────────────────────────────────

Given('I am on the Sign up page', async ({ signUpPage }) => {
  await signUpPage.open();
  await expect(signUpPage.heading).toBeVisible();
});

Given('an account already exists', async ({ request, scenario }) => {
  // Precondition created through the API: faster and independent of the UI under test
  scenario.account = newAccount();
  const response = await request.post(`${API_URL}/api/auth/register`, { data: scenario.account });
  expect(response.status()).toBe(201);
});

// ── When ──────────────────────────────────────────────────────────────

When('I sign up with valid new account details', async ({ signUpPage }) => {
  await signUpPage.signUp(newAccount());
});

When('I sign up with a password of exactly 6 characters', async ({ signUpPage }) => {
  await signUpPage.signUp(newAccount({ password: 'abc123' }));
});

When('I sign up using the email of that account', async ({ signUpPage, scenario }) => {
  await signUpPage.signUp(newAccount({ email: scenario.account!.email }));
});

When('I sign up with a name made only of spaces', async ({ signUpPage }) => {
  await signUpPage.signUp(newAccount({ name: '   ' }));
});

// "an email without an @" -> the problem decides which field value is broken
const brokenValues: Record<string, Partial<Parameters<typeof newAccount>[0]>> = {
  'no name': { name: '' },
  'no email': { email: '' },
  'an email without an @': { email: 'dana.example.com' },
  'no password': { password: '' },
  'a password of 5 characters': { password: 'abc12' },
};

When('I try to sign up with {string}', async ({ signUpPage }, problem: string) => {
  const overrides = brokenValues[problem];
  if (!overrides) throw new Error(`Unknown problem: ${problem}`);
  await signUpPage.signUp(newAccount(overrides));
});

// ── Then ──────────────────────────────────────────────────────────────

Then('I am taken to the dashboard', async ({ page, dashboardPage }) => {
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(dashboardPage.heading).toBeVisible();
});

Then('I am logged in', async ({ dashboardPage }) => {
  await expect(dashboardPage.logoutButton).toBeVisible();
});

Then('the error {string} is shown', async ({ signUpPage }, message: string) => {
  await expect(signUpPage.alert).toHaveText(message);
});

Then('I stay on the Sign up page', async ({ page, signUpPage }) => {
  await expect(page).toHaveURL(/\/register$/);
  await expect(signUpPage.heading).toBeVisible();
});

Then('the {string} field is flagged as invalid', async ({ signUpPage }, field: string) => {
  expect(await signUpPage.isFieldInvalid(field as SignUpField)).toBe(true);
});
