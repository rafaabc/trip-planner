import type { Locator, Page } from '@playwright/test';
import type { Account } from '../support/test-data';

export type SignUpField = 'Name' | 'Email' | 'Password';

// Page object: locators and user actions only. Assertions live in the step definitions.
export class SignUpPage {
  readonly heading: Locator;
  readonly submitButton: Locator;
  readonly alert: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Sign up' });
    this.submitButton = page.getByRole('button', { name: 'Create account' });
    this.alert = page.getByRole('alert');
  }

  field(name: SignUpField): Locator {
    // The password label is "Password (min. 6 characters)", so match the start of the label
    return this.page.getByLabel(new RegExp(`^${name}`));
  }

  async open() {
    await this.page.goto('/register');
  }

  async signUp(account: Partial<Account>) {
    await this.field('Name').fill(account.name ?? '');
    await this.field('Email').fill(account.email ?? '');
    await this.field('Password').fill(account.password ?? '');
    await this.submitButton.click();
  }

  // Native browser validation: the field state, not the browser-specific message text
  async isFieldInvalid(name: SignUpField): Promise<boolean> {
    return this.field(name).evaluate((el) => !(el as HTMLInputElement).validity.valid);
  }
}
