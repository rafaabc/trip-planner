import type { Locator, Page } from '@playwright/test';
import type { ItemDetails } from '../support/test-data';

// Page object: locators and user actions only. Assertions live in the step definitions.
export class TripDetailPage {
  readonly categoryField: Locator;
  readonly amountField: Locator;
  readonly descriptionField: Locator;
  readonly addButton: Locator;
  readonly grandTotalCard: Locator;
  readonly dailyBudgetCard: Locator;

  constructor(private readonly page: Page) {
    this.categoryField = page.getByLabel('Category');
    this.amountField = page.getByLabel('Amount (DKK)');
    this.descriptionField = page.getByLabel('Description (optional)');
    this.addButton = page.getByRole('button', { name: 'Add item' });
    // The grand total card has no heading or role, so it is found by its label text.
    this.grandTotalCard = page.locator('.total-card').filter({ hasText: 'Grand total' });
    this.dailyBudgetCard = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Daily budget' }),
    });
  }

  async open(tripId: number) {
    await this.page.goto(`/trips/${tripId}`);
  }

  heading(title: string): Locator {
    return this.page.getByRole('heading', { name: title, level: 2 });
  }

  async addItem(item: ItemDetails) {
    await this.categoryField.selectOption(item.category);
    await this.amountField.fill(item.amount);
    await this.descriptionField.fill(item.description);
    await this.addButton.click();
  }

  // The table row of an item, found by its description
  itemRow(description: string): Locator {
    return this.page.getByRole('row').filter({ hasText: description });
  }

  // The line of the "Total by category" list for one category
  categoryTotal(category: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: category });
  }
}
