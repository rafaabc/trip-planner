const CATEGORIES = [
  'Flights',
  'Accommodation',
  'Activities',
  'Food',
  'Transport',
  'Travel insurance',
  'Extras',
];

// Costs paid during the trip. Pre-trip costs (Flights, Accommodation, Travel insurance) are excluded.
const DAILY_CATEGORIES = ['Activities', 'Food', 'Transport', 'Extras'];

const CURRENCY = 'DKK';

module.exports = { CATEGORIES, DAILY_CATEGORIES, CURRENCY };
