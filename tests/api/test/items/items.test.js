const request = require('supertest');
const { expect } = require('chai');
const { createLoggedInUser } = require('../helpers/session');
const data = require('../../fixtures/items.json');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TRIPS_PATH = '/api/trips';

const authorized = (req, token) => req.set('Authorization', `Bearer ${token}`);
const itemsPath = (tripId) => `${TRIPS_PATH}/${tripId}/items`;
const createTrip = (token) =>
  authorized(request(BASE_URL).post(TRIPS_PATH), token).send(data.validTrip);
const createItem = (token, tripId, body) =>
  authorized(request(BASE_URL).post(itemsPath(tripId)), token).send(body);
const listItems = (token, tripId) => authorized(request(BASE_URL).get(itemsPath(tripId)), token);
const getItem = (token, tripId, itemId) =>
  authorized(request(BASE_URL).get(`${itemsPath(tripId)}/${itemId}`), token);
const updateItem = (token, tripId, itemId, body) =>
  authorized(request(BASE_URL).put(`${itemsPath(tripId)}/${itemId}`), token).send(body);
const deleteItem = (token, tripId, itemId) =>
  authorized(request(BASE_URL).delete(`${itemsPath(tripId)}/${itemId}`), token);
const getDashboard = (token, tripId) =>
  authorized(request(BASE_URL).get(`${TRIPS_PATH}/${tripId}/dashboard`), token);

// Trips and items are created through the API, so each test owns its data.
async function createOwnTrip(token) {
  const res = await createTrip(token);
  expect(res.status, 'the trip must be created').to.equal(201);
  return res.body;
}

async function createOwnItem(token, tripId, body = data.validItem) {
  const res = await createItem(token, tripId, body);
  expect(res.status, 'the item must be created').to.equal(201);
  return res.body;
}

describe('US-04 Manage Budget Items - /api/trips/{tripId}/items', () => {
  let owner;
  let other;

  before(async () => {
    owner = await createLoggedInUser('owner');
    other = await createLoggedInUser('other');
  });

  describe('TC-04-01 Create a budget item with and without the optional description', () => {
    it('should return 201 with the item and its description', async () => {
      const trip = await createOwnTrip(owner.token);

      const res = await createItem(owner.token, trip.id, data.validItem);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.all.keys('id', 'tripId', 'category', 'amount', 'description');
      expect(res.body.id).to.be.a('number');
      expect(res.body.tripId).to.equal(trip.id);
      expect(res.body).to.include(data.validItem);
    });

    it('should return 201 with an empty description when the description is not sent', async () => {
      const trip = await createOwnTrip(owner.token);
      const { category, amount } = data.validItem;

      const res = await createItem(owner.token, trip.id, { category, amount });

      expect(res.status).to.equal(201);
      expect(res.body).to.include({ tripId: trip.id, category, amount, description: '' });
    });

    it('should return the same item when it is read afterwards', async () => {
      const trip = await createOwnTrip(owner.token);
      const created = await createOwnItem(owner.token, trip.id);

      const res = await getItem(owner.token, trip.id, created.id);

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(created);
    });
  });

  describe('TC-04-02 Create items using each of the seven allowed categories', () => {
    data.categories.forEach((category) => {
      it(`should return 201 when the category is ${category}`, async () => {
        const trip = await createOwnTrip(owner.token);

        const res = await createItem(owner.token, trip.id, { category, amount: 100 });

        expect(res.status).to.equal(201);
        expect(res.body.category).to.equal(category);
      });
    });
  });

  describe('TC-04-03 Create an item with a category that is not allowed', () => {
    data.invalidCategory.forEach(({ description, category }) => {
      it(`should return 400 and not store the item when ${description}`, async () => {
        const trip = await createOwnTrip(owner.token);

        const res = await createItem(owner.token, trip.id, { category, amount: 100 });
        const list = await listItems(owner.token, trip.id);

        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/^category must be one of: /);
        expect(res.body).to.not.have.property('id');
        expect(list.body).to.be.an('array').that.is.empty;
      });
    });
  });

  describe('TC-04-04 Create an item with an amount of 0', () => {
    it('should return 201 and store the amount 0', async () => {
      const trip = await createOwnTrip(owner.token);

      const res = await createItem(owner.token, trip.id, { category: 'Extras', amount: 0 });

      expect(res.status).to.equal(201);
      expect(res.body.amount).to.equal(0);
    });
  });

  describe('TC-04-05 Create an item with a negative or non-numeric amount', () => {
    data.invalidAmount.forEach(({ description, amount }) => {
      it(`should return 400 and not store the item when ${description}`, async () => {
        const trip = await createOwnTrip(owner.token);

        const res = await createItem(owner.token, trip.id, { category: 'Food', amount });
        const list = await listItems(owner.token, trip.id);

        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal('amount must be a non-negative number (DKK)');
        expect(res.body).to.not.have.property('id');
        expect(list.body).to.be.an('array').that.is.empty;
      });
    });
  });

  describe('TC-04-06 List the items of an own trip', () => {
    it('should return all the items of that trip and no item of another trip', async () => {
      const trip = await createOwnTrip(owner.token);
      const otherTrip = await createOwnTrip(owner.token);
      const items = [
        await createOwnItem(owner.token, trip.id),
        await createOwnItem(owner.token, trip.id, { category: 'Food', amount: 250 }),
      ];
      await createOwnItem(owner.token, otherTrip.id);

      const res = await listItems(owner.token, trip.id);

      expect(res.status).to.equal(200);
      expect(res.body.map((item) => item.id)).to.have.members(items.map((item) => item.id));
      expect(res.body.every((item) => item.tripId === trip.id)).to.equal(true);
    });

    it('should return an empty list when the trip has no items', async () => {
      const trip = await createOwnTrip(owner.token);

      const res = await listItems(owner.token, trip.id);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array').that.is.empty;
    });
  });

  describe('TC-04-10, TC-04-11, TC-04-12 and TC-04-13 Access the items of another user trip', () => {
    const send = (method, token, tripId, itemId, body) => {
      if (method === 'GET') return listItems(token, tripId);
      if (method === 'POST') return createItem(token, tripId, body);
      if (method === 'PUT') return updateItem(token, tripId, itemId, body);
      return deleteItem(token, tripId, itemId);
    };

    data.otherUserAccess.forEach(
      ({ testCase, description, method, body, expectedStatus, expectedMessage }) => {
        it(`should return ${expectedStatus} when another user ${description} the trip (${testCase})`, async () => {
          const trip = await createOwnTrip(owner.token);
          const item = await createOwnItem(owner.token, trip.id);

          const res = await send(method, other.token, trip.id, item.id, body);

          expect(res.status).to.equal(expectedStatus);
          expect(res.body.message).to.equal(expectedMessage);
        });

        it(`should leave the items of the trip unchanged for its owner (${testCase})`, async () => {
          const trip = await createOwnTrip(owner.token);
          const item = await createOwnItem(owner.token, trip.id);

          await send(method, other.token, trip.id, item.id, body);
          const read = await getItem(owner.token, trip.id, item.id);
          const list = await listItems(owner.token, trip.id);

          expect(read.status).to.equal(200);
          expect(read.body).to.deep.equal(item);
          expect(list.body).to.deep.equal([item]);
        });
      },
    );
  });

  // Guardrails: these tests describe the expected behavior of open bugs and are
  // expected to FAIL until the bugs are fixed.
  describe('Guardrails for known bugs', () => {
    describe('@bug #56 BUG-005 Amount 1e308 is stored as null', () => {
      it('should reject the amount or store it as a number, never as null', async () => {
        const trip = await createOwnTrip(owner.token);

        const res = await createItem(owner.token, trip.id, {
          category: 'Food',
          amount: data.hugeAmount,
        });

        expect(res.status).to.be.oneOf([201, 400]);
        if (res.status === 201) {
          expect(res.body.amount, 'the stored amount').to.be.a('number');
        }
      });

      it('should keep the trip dashboard totals as numbers after the amount is sent', async () => {
        const trip = await createOwnTrip(owner.token);
        await createItem(owner.token, trip.id, { category: 'Food', amount: data.hugeAmount });

        const res = await getDashboard(owner.token, trip.id);

        expect(res.status).to.equal(200);
        expect(res.body.grandTotal, 'grandTotal').to.be.a('number');
        expect(res.body.dailyBudget.perDay, 'dailyBudget.perDay').to.be.a('number');
      });
    });
  });
});
