const request = require('supertest');
const { expect } = require('chai');
const { buildPayload, uniqueEmail } = require('../helpers/user');
const data = require('../../fixtures/register.json');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const REGISTER_PATH = '/api/auth/register';

// Body limit of the API is 100 KB (102400 bytes), see BUG-001
const OVERSIZED_NAME_LENGTH = 110 * 1024;

const register = (body) => request(BASE_URL).post(REGISTER_PATH).send(body);

describe('US-01 Sign Up - POST /api/auth/register', () => {
  describe('TC-01-01 Registration with valid name, email and password', () => {
    data.valid.forEach(({ description, payload, expectedStatus }) => {
      it(`should return ${expectedStatus} when ${description}`, async () => {
        const body = buildPayload(payload);

        const res = await register(body);

        expect(res.status).to.equal(expectedStatus);
        expect(res.body).to.have.all.keys('id', 'name', 'email');
        expect(res.body.id).to.be.a('number');
        expect(res.body.name).to.equal(body.name);
        expect(res.body.email).to.equal(body.email);
      });
    });
  });

  describe('TC-01-02 Registration with a missing required field', () => {
    data.missingField.forEach(({ description, payload, expectedStatus, expectedMessage }) => {
      it(`should return ${expectedStatus} when ${description}`, async () => {
        const res = await register(buildPayload(payload));

        expect(res.status).to.equal(expectedStatus);
        expect(res.body.message).to.equal(expectedMessage);
      });
    });
  });

  describe('TC-01-03 Registration with an email that is already in use', () => {
    data.duplicateEmail.forEach(
      ({ description, emailTransform, expectedStatus, expectedMessage }) => {
        it(`should return ${expectedStatus} when ${description}`, async () => {
          const email = uniqueEmail('dup');
          const user = { name: 'Dana Olsen', email, password: 'secret123' };
          const first = await register(user);
          expect(first.status, 'the first registration must succeed').to.equal(201);

          const repeated = emailTransform === 'uppercase' ? email.toUpperCase() : email;
          const res = await register({ ...user, email: repeated });

          expect(res.status).to.equal(expectedStatus);
          expect(res.body.message).to.equal(expectedMessage);
        });
      },
    );
  });

  describe('TC-01-04 Password is never exposed in the registration response', () => {
    it('should not return the password or its hash', async () => {
      const password = 'secret123';

      const res = await register({ name: 'Dana Olsen', email: uniqueEmail('pwd'), password });

      expect(res.status).to.equal(201);
      expect(res.body).to.not.have.any.keys('password', 'passwordHash');
      expect(JSON.stringify(res.body)).to.not.include(password);
    });
  });

  // Guardrails: these tests describe the expected behavior of open bugs and are
  // expected to FAIL until the bugs are fixed.
  describe('Guardrails for known bugs', () => {
    describe('@bug #19 BUG-001 Oversized request body', () => {
      it('should return 413 when the request body exceeds the size limit', async () => {
        const res = await register({
          name: 'a'.repeat(OVERSIZED_NAME_LENGTH),
          email: uniqueEmail('big'),
          password: 'secret123',
        });

        expect(res.status).to.equal(413);
      });
    });

    describe('@bug #20 BUG-002 Messages for wrong-type values', () => {
      data.wrongType.forEach(({ description, payload, misleadingMessage }) => {
        it(`should return 400 with a message about the type when ${description}`, async () => {
          const res = await register(buildPayload(payload));

          expect(res.status).to.equal(400);
          expect(res.body.message).to.not.equal(misleadingMessage);
          expect(res.body.message).to.match(/string/i);
        });
      });
    });
  });
});
