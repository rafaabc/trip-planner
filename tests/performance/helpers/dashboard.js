// Helpers for scenarios/dashboard.yml (US-05, issue #39).
//
// The setup requests are sent with fetch, not with Artillery, so they are not counted in the
// response time statistics. Only the requests of the scenario are measured.

const ITEM_COUNT = 200;
const TRIP_DAYS = 6;
const CATEGORIES = [
  'Flights',
  'Accommodation',
  'Activities',
  'Food',
  'Transport',
  'Travel insurance',
  'Extras',
];
// Costs paid during the trip. Must match DAILY_CATEGORIES in src/constants.js.
const DAILY_CATEGORIES = ['Activities', 'Food', 'Transport', 'Extras'];

// The item i has the category CATEGORIES[i % 7] and the amount i * 10, so the expected totals
// can be calculated here, independent of the API.
const categoryOf = (i) => CATEGORIES[i % CATEGORIES.length];
const amountOf = (i) => i * 10;

function expectedTotals() {
  const byCategory = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
  for (let i = 1; i <= ITEM_COUNT; i += 1) {
    byCategory[categoryOf(i)] += amountOf(i);
  }
  const grandTotal = Object.values(byCategory).reduce((sum, total) => sum + total, 0);
  const dailyTotal = DAILY_CATEGORIES.reduce((sum, category) => sum + byCategory[category], 0);
  return {
    byCategory,
    grandTotal,
    dailyTotal,
    perDay: Math.round((dailyTotal / TRIP_DAYS) * 100) / 100,
  };
}

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
// one 6-day trip that has 200 budget items. The token and the trip id are kept in the
// variables of every virtual user.
// An async function has no callback: a thrown error stops the run.
async function seedDashboard(context) {
  const target = context.vars.target;
  const user = {
    name: 'Dana Olsen',
    email: `perf.dashboard.${Date.now()}.${Math.random().toString(36).slice(2, 10)}@example.com`,
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
      body: { category: categoryOf(i), amount: amountOf(i), description: `Item ${i}` },
    });
  }

  context.vars.token = token;
  context.vars.tripId = trip.id;
}

// The measurement only means something if the dashboard sums the 200 items correctly
// (the test plan expects "correct totals").
function checkDashboardTotals(req, res, context, events, done) {
  const dashboard = JSON.parse(res.body);
  const expected = expectedTotals();
  const actualByCategory = Object.fromEntries(
    dashboard.totalByCategory.map(({ category, total }) => [category, total]),
  );

  const problems = [];
  if (dashboard.grandTotal !== expected.grandTotal) {
    problems.push(`grandTotal ${dashboard.grandTotal}, expected ${expected.grandTotal}`);
  }
  for (const category of CATEGORIES) {
    if (actualByCategory[category] !== expected.byCategory[category]) {
      problems.push(
        `${category} ${actualByCategory[category]}, expected ${expected.byCategory[category]}`,
      );
    }
  }
  const daily = dashboard.dailyBudget;
  if (daily.days !== TRIP_DAYS) problems.push(`days ${daily.days}, expected ${TRIP_DAYS}`);
  if (daily.total !== expected.dailyTotal) {
    problems.push(`daily total ${daily.total}, expected ${expected.dailyTotal}`);
  }
  if (daily.perDay !== expected.perDay) {
    problems.push(`perDay ${daily.perDay}, expected ${expected.perDay}`);
  }

  return done(problems.length ? new Error(`Wrong dashboard: ${problems.join('; ')}`) : undefined);
}

module.exports = { seedDashboard, checkDashboardTotals };
