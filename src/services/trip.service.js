const trips = require('../models/trip.model');
const items = require('../models/budgetItem.model');
const { AppError } = require('../errors');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function withTitle(trip) {
  return { ...trip, title: `Trip budget - ${trip.cityFrom} - ${trip.cityTo}` };
}

function validate(data, partial) {
  const out = {};
  for (const field of ['cityFrom', 'cityTo']) {
    if (data[field] !== undefined || !partial) {
      if (typeof data[field] !== 'string' || !data[field].trim()) {
        throw new AppError(400, `${field} is required`);
      }
      out[field] = data[field].trim();
    }
  }
  for (const field of ['startDate', 'endDate']) {
    if (data[field] !== undefined || !partial) {
      if (!isValidDate(data[field])) throw new AppError(400, `${field} must be a valid date (YYYY-MM-DD)`);
      out[field] = data[field];
    }
  }
  return out;
}

// Returns the trip only if it belongs to the user. Responds 404 otherwise,
// so other users' trip ids are not revealed.
function getOwnedTrip(userId, tripId) {
  const trip = trips.findById(tripId);
  if (!trip || trip.userId !== userId) throw new AppError(404, 'Trip not found');
  return trip;
}

function list(userId) {
  return trips.findAll((t) => t.userId === userId).map(withTitle);
}

function get(userId, tripId) {
  return withTitle(getOwnedTrip(userId, tripId));
}

function create(userId, data = {}) {
  const fields = validate(data, false);
  if (fields.endDate < fields.startDate) throw new AppError(400, 'endDate must not be before startDate');
  return withTitle(trips.create({ userId, ...fields }));
}

function update(userId, tripId, data = {}) {
  const current = getOwnedTrip(userId, tripId);
  const fields = validate(data, true);
  const merged = { ...current, ...fields };
  if (merged.endDate < merged.startDate) throw new AppError(400, 'endDate must not be before startDate');
  return withTitle(trips.update(tripId, fields));
}

function remove(userId, tripId) {
  getOwnedTrip(userId, tripId);
  items.removeWhere((i) => i.tripId === tripId);
  trips.remove(tripId);
}

module.exports = { list, get, create, update, remove, getOwnedTrip, isValidDate };
