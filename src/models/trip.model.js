const { createCollection } = require('./store');

// Trip: { id, userId, cityFrom, cityTo, startDate (YYYY-MM-DD), endDate (YYYY-MM-DD) }
module.exports = createCollection();
