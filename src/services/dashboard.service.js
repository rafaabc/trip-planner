const items = require('../models/budgetItem.model');
const { CATEGORIES, CURRENCY } = require('../constants');
const { getOwnedTrip } = require('./trip.service');

const round = (n) => Math.round(n * 100) / 100;

function summarize(tripItems) {
  const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  const byDay = {};
  let total = 0;
  for (const item of tripItems) {
    byCategory[item.category] += item.amount;
    byDay[item.date] = (byDay[item.date] || 0) + item.amount;
    total += item.amount;
  }
  return {
    currency: CURRENCY,
    totalByCategory: CATEGORIES.map((category) => ({ category, total: round(byCategory[category]) })),
    totalByDay: Object.keys(byDay)
      .sort()
      .map((date) => ({ date, total: round(byDay[date]) })),
    grandTotal: round(total),
  };
}

function forTrip(userId, tripId) {
  const trip = getOwnedTrip(userId, tripId);
  return { tripId: trip.id, ...summarize(items.findAll((i) => i.tripId === trip.id)) };
}

module.exports = { forTrip };
