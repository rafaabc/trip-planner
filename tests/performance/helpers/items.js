// Helpers for scenarios/items.yml (US-04, issue #38).
//
// The setup requests are sent with fetch, not with Artillery, so they are not counted in the
// response time statistics. Only the requests of the scenario are measured.

const ITEM_COUNT = 200;
const CATEGORIES = [
  'Flights',
  'Accommodation',
  'Activities',
  'Food',
  'Transport',
  'Travel insurance',
  'Extras',
];

async function call(target, path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${target}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`${method} ${path} returned ${response.status}, expected a 2xx status`);
  }
  return response.json();
}

// Runs once before the load phase: one new user (random email, the store is in memory) with
// one trip that has 200 budget items. The token and the trip id are kept in the variables of
// every virtual user.
// An async function has no callback: a thrown error stops the run.
async function seedItems(context) {
  const target = context.vars.target;
  const user = {
    name: 'Dana Olsen',
    email: `perf.items.${Date.now()}.${Math.random().toString(36).slice(2, 10)}@example.com`,
    password: 'secret123',
  };
  await call(target, '/api/auth/register', { method: 'POST', body: user });
  const { token } = await call(target, '/api/auth/login', {
    method: 'POST',
    body: { email: user.email, password: user.password },
  });
  const trip = await call(target, '/api/trips', {
    method: 'POST',
    token,
    body: {
      cityFrom: 'Copenhagen',
      cityTo: 'Lisbon',
      startDate: '2027-03-10',
      endDate: '2027-03-15',
    },
  });

  for (let i = 1; i <= ITEM_COUNT; i += 1) {
    await call(target, `/api/trips/${trip.id}/items`, {
      method: 'POST',
      token,
      body: {
        category: CATEGORIES[i % CATEGORIES.length],
        amount: i * 10,
        description: `Item ${i}`,
      },
    });
  }

  context.vars.token = token;
  context.vars.tripId = trip.id;
}

// The measurement only means something if the trip really has 200 items.
function checkItemCount(req, res, context, events, done) {
  const items = JSON.parse(res.body);
  if (!Array.isArray(items) || items.length !== ITEM_COUNT) {
    return done(new Error(`Expected ${ITEM_COUNT} items, got ${items.length}`));
  }
  return done();
}

module.exports = { seedItems, checkItemCount };
