import type { Locator, Page } from '@playwright/test';
import type { TripDetails } from '../support/test-data';

// Page object: locators and user actions only. Assertions live in the step definitions.
export class TripsPage {
  readonly heading: Locator;
  readonly fromField: Locator;
  readonly toField: Locator;
  readonly startDateField: Locator;
  readonly endDateField: Locator;
  readonly createButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Trips', exact: true });
    this.fromField = page.getByLabel('From', { exact: true });
    this.toField = page.getByLabel('To', { exact: true });
    this.startDateField = page.getByLabel('Start date');
    this.endDateField = page.getByLabel('End date');
    this.createButton = page.getByRole('button', { name: 'Create trip' });
  }

  async open() {
    await this.page.goto('/trips');
  }

  async createTrip(trip: TripDetails) {
    await this.fromField.fill(trip.cityFrom);
    await this.toField.fill(trip.cityTo);
    await this.startDateField.fill(trip.startDate);
    await this.endDateField.fill(trip.endDate);
    await this.createButton.click();
  }

  // The list entry of a trip, found by its generated name
  tripEntry(title: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: title });
  }
}
