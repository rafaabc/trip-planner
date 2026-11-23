const request = require('supertest');
const { expect } = require('chai');
const { uniqueEmail } = require('./user');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Registers a new user with a unique email and logs in. Every test file that needs
// an authenticated user builds its own, so no test depends on the seed data.
async function createLoggedInUser(prefix = 'user') {
  const user = { name: 'Dana Olsen', email: uniqueEmail(prefix), password: 'secret123' };

  const registered = await request(BASE_URL).post('/api/auth/register').send(user);
  expect(registered.status, 'the user must be registered').to.equal(201);

  const login = await request(BASE_URL)
    .post('/api/auth/login')
    .send({ email: user.email, password: user.password });
  expect(login.status, 'the user must be logged in').to.equal(200);

  return { user, token: login.body.token };
}

module.exports = { createLoggedInUser };
