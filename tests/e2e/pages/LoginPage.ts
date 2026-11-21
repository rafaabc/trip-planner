import type { Locator, Page } from '@playwright/test';
import type { Account } from '../support/test-data';

// Page object: locators and user actions only. Assertions live in the step definitions.
export class LoginPage {
  readonly heading: Locator;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Log in' });
    this.emailField = page.getByLabel('Email');
    this.passwordField = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Log in' });
  }

  async open() {
    await this.page.goto('/login');
  }

  async logIn(credentials: Pick<Account, 'email' | 'password'>) {
    await this.emailField.fill(credentials.email);
    await this.passwordField.fill(credentials.password);
    await this.submitButton.click();
  }
}
