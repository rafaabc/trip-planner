const items = require('../models/budgetItem.model');
const { CATEGORIES, DAILY_CATEGORIES, CURRENCY } = require('../constants');
const { getOwnedTrip } = require('./trip.service');

const round = (n) => Math.round(n * 100) / 100;
const DAY_MS = 24 * 60 * 60 * 1000;

// Inclusive number of days, e.g. 2026-03-10 to 2026-03-15 = 6 days.
function tripDays(trip) {
  return Math.round((Date.parse(trip.endDate) - Date.parse(trip.startDate)) / DAY_MS) + 1;
}

function forTrip(userId, tripId) {
  const trip = getOwnedTrip(userId, tripId);
  const tripItems = items.findAll((i) => i.tripId === trip.id);

  const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  let grandTotal = 0;
  for (const item of tripItems) {
    byCategory[item.category] += item.amount;
    grandTotal += item.amount;
  }

  // Daily budget only counts costs paid during the trip (pre-trip costs excluded).
  const days = tripDays(trip);
  const dailyTotal = DAILY_CATEGORIES.reduce((sum, c) => sum + byCategory[c], 0);

  return {
    tripId: trip.id,
    currency: CURRENCY,
    totalByCategory: CATEGORIES.map((category) => ({ category, total: round(byCategory[category]) })),
    grandTotal: round(grandTotal),
    dailyBudget: {
      days,
      categories: DAILY_CATEGORIES,
      total: round(dailyTotal),
      perDay: round(dailyTotal / days),
    },
  };
}

module.exports = { forTrip };
