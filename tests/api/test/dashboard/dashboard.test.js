const request = require('supertest');
const { expect } = require('chai');
const { createLoggedInUser } = require('../helpers/session');
const data = require('../../fixtures/dashboard.json');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TRIPS_PATH = '/api/trips';

const authorized = (req, token) => req.set('Authorization', `Bearer ${token}`);
const getDashboard = (token, tripId) =>
  authorized(request(BASE_URL).get(`${TRIPS_PATH}/${tripId}/dashboard`), token);

// Trips and items are created through the API, so each test owns its data.
async function createOwnTrip(token, trip) {
  const res = await authorized(request(BASE_URL).post(TRIPS_PATH), token).send(trip);
  expect(res.status, 'the trip must be created').to.equal(201);
  return res.body;
}

async function addItem(token, tripId, item) {
  const res = await authorized(request(BASE_URL).post(`${TRIPS_PATH}/${tripId}/items`), token).send(
    item,
  );
  expect(res.status, 'the item must be created').to.equal(201);
  return res.body;
}

async function createTripWithItems(token, trip, items) {
  const created = await createOwnTrip(token, trip);
  for (const item of items) {
    await addItem(token, created.id, item);
  }
  return created;
}

const totalsByCategory = (body) =>
  Object.fromEntries(body.totalByCategory.map(({ category, total }) => [category, total]));

describe('US-05 View Trip Dashboard - GET /api/trips/{tripId}/dashboard', () => {
  let owner;
  let other;

  before(async () => {
    owner = await createLoggedInUser('owner');
    other = await createLoggedInUser('other');
  });

  describe('TC-05-01 View the dashboard of a trip with several items in the same category', () => {
    it('should return 200 with the currency and the trip id', async () => {
      const { trip, items } = data.multiDayTrip;
      const created = await createTripWithItems(owner.token, trip, items);

      const res = await getDashboard(owner.token, created.id);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.all.keys(
        'tripId',
        'currency',
        'totalByCategory',
        'grandTotal',
        'dailyBudget',
      );
      expect(res.body.tripId).to.equal(created.id);
      expect(res.body.currency).to.equal('DKK');
    });

    it('should list every category once, in the category order, with the sum of its items', async () => {
      const { trip, items, expectedTotals } = data.multiDayTrip;
      const created = await createTripWithItems(owner.token, trip, items);

      const res = await getDashboard(owner.token, created.id);

      expect(res.body.totalByCategory.map((entry) => entry.category)).to.deep.equal(
        data.categories,
      );
      expect(totalsByCategory(res.body)).to.deep.equal(expectedTotals);
    });

    it('should return a grand total equal to the sum of all items', async () => {
      const { trip, items, expectedGrandTotal } = data.multiDayTrip;
      const created = await createTripWithItems(owner.token, trip, items);

      const res = await getDashboard(owner.token, created.id);

      expect(res.body.grandTotal).to.equal(expectedGrandTotal);
    });
  });

  describe('TC-05-03 View the daily budget of a trip that lasts several days', () => {
    it('should count the days inclusively and divide the in-trip costs by them', async () => {
      const { trip, items, expectedDaily } = data.multiDayTrip;
      const created = await createTripWithItems(owner.token, trip, items);

      const res = await getDashboard(owner.token, created.id);

      expect(res.body.dailyBudget).to.deep.equal({
        ...expectedDaily,
        categories: data.dailyCategories,
      });
    });
  });

  describe('TC-05-04 View the daily budget of a one-day trip (boundary)', () => {
    it('should count 1 day when the start and the end date are the same', async () => {
      const { trip, items, expectedDaily } = data.oneDayTrip;
      const created = await createTripWithItems(owner.token, trip, items);

      const res = await getDashboard(owner.token, created.id);

      expect(res.status).to.equal(200);
      expect(res.body.dailyBudget.days).to.equal(expectedDaily.days);
      expect(res.body.dailyBudget.total).to.equal(expectedDaily.total);
      expect(res.body.dailyBudget.perDay).to.equal(expectedDaily.perDay);
    });
  });

  describe('TC-05-05 Change only Flights, Accommodation or Travel insurance amounts', () => {
    data.preTripChange.preTripItems.forEach((preTripItem) => {
      it(`should keep the daily budget and raise the grand total when an item in ${preTripItem.category} is added`, async () => {
        const { trip, inTripItem, expectedDaily } = data.preTripChange;
        const created = await createTripWithItems(owner.token, trip, [inTripItem]);
        const before = await getDashboard(owner.token, created.id);

        await addItem(owner.token, created.id, preTripItem);
        const after = await getDashboard(owner.token, created.id);

        expect(before.body.dailyBudget).to.deep.include(expectedDaily);
        expect(after.body.dailyBudget).to.deep.equal(before.body.dailyBudget);
        expect(after.body.grandTotal).to.equal(before.body.grandTotal + preTripItem.amount);
        expect(totalsByCategory(after.body)[preTripItem.category]).to.equal(preTripItem.amount);
      });
    });

    it('should keep the daily budget when all three pre-trip categories are added together', async () => {
      const { trip, inTripItem, preTripItems, expectedDaily } = data.preTripChange;
      const created = await createTripWithItems(owner.token, trip, [inTripItem, ...preTripItems]);

      const res = await getDashboard(owner.token, created.id);

      expect(res.body.dailyBudget).to.deep.include(expectedDaily);
    });
  });

  describe('TC-05-06 View the dashboard of a trip that has no items', () => {
    it('should return 200 with every category at 0 and a grand total of 0', async () => {
      const created = await createOwnTrip(owner.token, data.emptyTrip);

      const res = await getDashboard(owner.token, created.id);

      expect(res.status).to.equal(200);
      expect(res.body.totalByCategory.map((entry) => entry.category)).to.deep.equal(
        data.categories,
      );
      res.body.totalByCategory.forEach((entry) => expect(entry.total).to.equal(0));
      expect(res.body.grandTotal).to.equal(0);
    });

    it('should return a daily budget of 0 for the days of the trip', async () => {
      const created = await createOwnTrip(owner.token, data.emptyTrip);

      const res = await getDashboard(owner.token, created.id);

      expect(res.body.dailyBudget).to.deep.equal({
        days: 3,
        categories: data.dailyCategories,
        total: 0,
        perDay: 0,
      });
    });
  });

  describe('TC-05-08 View the dashboard of a trip that belongs to another user', () => {
    it('should return 404 without revealing that the trip exists', async () => {
      const { trip, items } = data.multiDayTrip;
      const created = await createTripWithItems(owner.token, trip, items);

      const res = await getDashboard(other.token, created.id);

      expect(res.status).to.equal(data.otherUserAccess.expectedStatus);
      expect(res.body.message).to.equal(data.otherUserAccess.expectedMessage);
      expect(res.body).to.not.have.property('grandTotal');
    });

    it('should still return the dashboard to its owner', async () => {
      const { trip, items, expectedGrandTotal } = data.multiDayTrip;
      const created = await createTripWithItems(owner.token, trip, items);

      await getDashboard(other.token, created.id);
      const res = await getDashboard(owner.token, created.id);

      expect(res.status).to.equal(200);
      expect(res.body.grandTotal).to.equal(expectedGrandTotal);
    });
  });
});
