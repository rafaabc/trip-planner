const request = require('supertest');
const { expect } = require('chai');
const { createLoggedInUser } = require('../helpers/session');
const data = require('../../fixtures/trips.json');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TRIPS_PATH = '/api/trips';
const NON_EXISTENT_TRIP_ID = 999999;

const authorized = (req, token) => req.set('Authorization', `Bearer ${token}`);
const createTrip = (token, body) =>
  authorized(request(BASE_URL).post(TRIPS_PATH), token).send(body);
const listTrips = (token) => authorized(request(BASE_URL).get(TRIPS_PATH), token);
const getTrip = (token, id) => authorized(request(BASE_URL).get(`${TRIPS_PATH}/${id}`), token);
const updateTrip = (token, id, body) =>
  authorized(request(BASE_URL).put(`${TRIPS_PATH}/${id}`), token).send(body);
const deleteTrip = (token, id) =>
  authorized(request(BASE_URL).delete(`${TRIPS_PATH}/${id}`), token);

const { cityFrom, cityTo, startDate, endDate, expectedTitle } = data.validTrip;
const validPayload = { cityFrom, cityTo, startDate, endDate };

// The trip is created through the API, so each test owns its data.
async function createValidTrip(token) {
  const res = await createTrip(token, validPayload);
  expect(res.status, 'the trip must be created').to.equal(201);
  return res.body;
}

describe('US-03 Manage Trip Budgets - /api/trips', () => {
  let owner;
  let other;

  before(async () => {
    owner = await createLoggedInUser('owner');
    other = await createLoggedInUser('other');
  });

  describe('TC-03-01 Create a trip with valid start and end dates', () => {
    it('should return 201 with the trip, its owner and the generated title', async () => {
      const res = await createTrip(owner.token, validPayload);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.all.keys(
        'id',
        'userId',
        'cityFrom',
        'cityTo',
        'startDate',
        'endDate',
        'title',
      );
      expect(res.body.id).to.be.a('number');
      expect(res.body).to.include(validPayload);
      expect(res.body.title).to.equal(expectedTitle);
    });

    it('should return the same trip when it is read afterwards', async () => {
      const created = await createValidTrip(owner.token);

      const res = await getTrip(owner.token, created.id);

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(created);
    });
  });

  describe('TC-03-02 and TC-03-03 Create a trip at the date boundary', () => {
    data.create.forEach(({ testCase, description, payload, expectedStatus, expectedMessage }) => {
      it(`should return ${expectedStatus} when ${description} (${testCase})`, async () => {
        const res = await createTrip(owner.token, payload);

        expect(res.status).to.equal(expectedStatus);
        if (expectedStatus === 201) {
          expect(res.body.startDate).to.equal(payload.startDate);
          expect(res.body.endDate).to.equal(payload.endDate);
        } else {
          expect(res.body.message).to.equal(expectedMessage);
          expect(res.body).to.not.have.property('id');
        }
      });
    });

    it('should not store the rejected trip', async () => {
      const rejected = data.create.find(({ expectedStatus }) => expectedStatus === 400);
      const user = await createLoggedInUser('rejected');

      await createTrip(user.token, rejected.payload);
      const res = await listTrips(user.token);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array').that.is.empty;
    });
  });

  describe('TC-03-04 Update a trip so that the end date is before the start date', () => {
    data.updateEndBeforeStart.forEach(
      ({ description, changes, expectedStatus, expectedMessage }) => {
        it(`should return ${expectedStatus} and keep the old dates when ${description}`, async () => {
          const trip = await createValidTrip(owner.token);

          const res = await updateTrip(owner.token, trip.id, changes);
          const after = await getTrip(owner.token, trip.id);

          expect(res.status).to.equal(expectedStatus);
          expect(res.body.message).to.equal(expectedMessage);
          expect(after.body.startDate).to.equal(trip.startDate);
          expect(after.body.endDate).to.equal(trip.endDate);
        });
      },
    );
  });

  describe('TC-03-06 List trips as a logged-in user', () => {
    it('should return only the trips of the logged-in user', async () => {
      const first = await createLoggedInUser('list-a');
      const second = await createLoggedInUser('list-b');
      const firstTrips = [await createValidTrip(first.token), await createValidTrip(first.token)];
      const secondTrips = [await createValidTrip(second.token)];

      const firstList = await listTrips(first.token);
      const secondList = await listTrips(second.token);

      expect(firstList.status).to.equal(200);
      expect(firstList.body.map((trip) => trip.id)).to.have.members(firstTrips.map((t) => t.id));
      expect(firstList.body.every((trip) => trip.userId === firstTrips[0].userId)).to.equal(true);
      expect(secondList.status).to.equal(200);
      expect(secondList.body.map((trip) => trip.id)).to.have.members(secondTrips.map((t) => t.id));
      expect(secondList.body.every((trip) => trip.userId === secondTrips[0].userId)).to.equal(true);
    });
  });

  describe('TC-03-10, TC-03-11 and TC-03-12 Access a trip that belongs to another user', () => {
    const send = (method, token, id, changes) => {
      if (method === 'GET') return getTrip(token, id);
      if (method === 'PUT') return updateTrip(token, id, changes);
      return deleteTrip(token, id);
    };

    data.otherUserAccess.forEach(
      ({ testCase, description, method, changes, expectedStatus, expectedMessage }) => {
        it(`should return ${expectedStatus} when another user ${description} the trip (${testCase})`, async () => {
          const trip = await createValidTrip(owner.token);

          const res = await send(method, other.token, trip.id, changes);

          expect(res.status).to.equal(expectedStatus);
          expect(res.body.message).to.equal(expectedMessage);
        });

        it(`should answer like a trip that does not exist when another user ${description} it (${testCase})`, async () => {
          const trip = await createValidTrip(owner.token);

          const foreign = await send(method, other.token, trip.id, changes);
          const missing = await send(method, other.token, NON_EXISTENT_TRIP_ID, changes);

          expect(foreign.status).to.equal(missing.status);
          expect(foreign.body).to.deep.equal(missing.body);
        });

        it(`should leave the trip unchanged for its owner (${testCase})`, async () => {
          const trip = await createValidTrip(owner.token);

          await send(method, other.token, trip.id, changes);
          const read = await getTrip(owner.token, trip.id);
          const list = await listTrips(owner.token);

          expect(read.status).to.equal(200);
          expect(read.body).to.deep.equal(trip);
          expect(list.body.map((t) => t.id)).to.include(trip.id);
        });
      },
    );
  });
});
