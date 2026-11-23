// Helpers for scenarios/trips.yml (US-03, issue #37).
//
// The setup requests are sent with fetch, not with Artillery, so they are not counted in the
// response time statistics. Only the requests of the scenario are measured.

const TRIP_COUNT = 100;

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
// 100 trips. The token is kept in the variables of every virtual user.
// An async function has no callback: a thrown error stops the run.
async function seedTrips(context) {
  const target = context.vars.target;
  const user = {
    name: 'Dana Olsen',
    email: `perf.trips.${Date.now()}.${Math.random().toString(36).slice(2, 10)}@example.com`,
    password: 'secret123',
  };
  await call(target, '/api/auth/register', { method: 'POST', body: user });
  const { token } = await call(target, '/api/auth/login', {
    method: 'POST',
    body: { email: user.email, password: user.password },
  });

  for (let i = 1; i <= TRIP_COUNT; i += 1) {
    await call(target, '/api/trips', {
      method: 'POST',
      token,
      body: {
        cityFrom: 'Copenhagen',
        cityTo: `City ${i}`,
        startDate: '2027-03-10',
        endDate: '2027-03-15',
      },
    });
  }

  context.vars.token = token;
}

// The measurement only means something if the user really has 100 trips.
function checkTripCount(req, res, context, events, done) {
  const trips = JSON.parse(res.body);
  if (!Array.isArray(trips) || trips.length !== TRIP_COUNT) {
    return done(new Error(`Expected ${TRIP_COUNT} trips, got ${trips.length}`));
  }
  return done();
}

module.exports = { seedTrips, checkTripCount };
