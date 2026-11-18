const items = require('../models/budgetItem.model');
const { AppError } = require('../errors');
const { CATEGORIES } = require('../constants');
const { getOwnedTrip } = require('./trip.service');

function validate(data, partial) {
  const out = {};
  if (data.category !== undefined || !partial) {
    if (!CATEGORIES.includes(data.category)) {
      throw new AppError(400, `category must be one of: ${CATEGORIES.join(', ')}`);
    }
    out.category = data.category;
  }
  if (data.amount !== undefined || !partial) {
    if (typeof data.amount !== 'number' || !Number.isFinite(data.amount) || data.amount < 0) {
      throw new AppError(400, 'amount must be a non-negative number (DKK)');
    }
    out.amount = Math.round(data.amount * 100) / 100;
  }
  if (data.description !== undefined) {
    if (typeof data.description !== 'string' || data.description.length > 500) {
      throw new AppError(400, 'description must be a string up to 500 characters');
    }
    out.description = data.description.trim();
  } else if (!partial) {
    out.description = '';
  }
  return out;
}

function getItem(trip, itemId) {
  const item = items.findById(itemId);
  if (!item || item.tripId !== trip.id) throw new AppError(404, 'Budget item not found');
  return item;
}

function list(userId, tripId) {
  const trip = getOwnedTrip(userId, tripId);
  return items.findAll((i) => i.tripId === trip.id);
}

function get(userId, tripId, itemId) {
  return getItem(getOwnedTrip(userId, tripId), itemId);
}

function create(userId, tripId, data = {}) {
  const trip = getOwnedTrip(userId, tripId);
  return items.create({ tripId: trip.id, ...validate(data, false) });
}

function update(userId, tripId, itemId, data = {}) {
  const trip = getOwnedTrip(userId, tripId);
  getItem(trip, itemId);
  return items.update(itemId, validate(data, true));
}

function remove(userId, tripId, itemId) {
  const trip = getOwnedTrip(userId, tripId);
  getItem(trip, itemId);
  items.remove(itemId);
}

module.exports = { list, get, create, update, remove };
