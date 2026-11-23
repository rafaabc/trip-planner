const request = require('supertest');
const { expect } = require('chai');
const { uniqueEmail } = require('../helpers/user');
const {
  signToken,
  expiredToken,
  withTamperedSignature,
  withTamperedPayload,
} = require('../helpers/token');
const data = require('../../fixtures/login.json');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const REGISTER_PATH = '/api/auth/register';
const LOGIN_PATH = '/api/auth/login';
const PROTECTED_PATH = '/api/trips';

// Body limit of the API is 100 KB (102400 bytes), see BUG-001
const OVERSIZED_EMAIL_LENGTH = 110 * 1024;

const register = (body) => request(BASE_URL).post(REGISTER_PATH).send(body);
const login = (body) => request(BASE_URL).post(LOGIN_PATH).send(body);
const getTrips = (authorization) => {
  const req = request(BASE_URL).get(PROTECTED_PATH);
  return authorization === null ? req : req.set('Authorization', authorization);
};

// The token carries iat in seconds, so two logins in the same second return the same token.
const waitForNextSecond = () => new Promise((resolve) => setTimeout(resolve, 1100));

// Every test uses its own registered user, so no test depends on the seed data.
async function createUser() {
  const user = { name: 'Dana Olsen', email: uniqueEmail('login'), password: 'secret123' };
  const res = await register(user);
  expect(res.status, 'the user must be registered').to.equal(201);
  return user;
}

describe('US-02 Log In - POST /api/auth/login and protected endpoints', () => {
  let user;

  before(async () => {
    user = await createUser();
  });

  describe('TC-02-01 Login with valid credentials', () => {
    it('should return 200 with a token and the user without the password', async () => {
      const res = await login({ email: user.email, password: user.password });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.all.keys('token', 'user');
      expect(res.body.token).to.be.a('string').and.not.empty;
      expect(res.body.token.split('.')).to.have.length(3);
      expect(res.body.user).to.have.all.keys('id', 'name', 'email');
      expect(res.body.user.email).to.equal(user.email);
      expect(res.body.user.name).to.equal(user.name);
      expect(JSON.stringify(res.body)).to.not.include(user.password);
    });
  });

  describe('TC-02-02 and TC-02-03 Login with invalid credentials', () => {
    data.invalidCredentials.forEach(
      ({ description, credentials, expectedStatus, expectedMessage }) => {
        it(`should return ${expectedStatus} when ${description}`, async () => {
          const body =
            credentials === 'wrongPassword'
              ? { email: user.email, password: 'not-the-password' }
              : { email: uniqueEmail('nobody'), password: user.password };

          const res = await login(body);

          expect(res.status).to.equal(expectedStatus);
          expect(res.body.message).to.equal(expectedMessage);
          expect(res.body).to.not.have.property('token');
        });
      },
    );

    it('should return the same status and message for a wrong password and an unknown email', async () => {
      const wrongPassword = await login({ email: user.email, password: 'not-the-password' });
      const unknownEmail = await login({ email: uniqueEmail('nobody'), password: user.password });

      expect(wrongPassword.status).to.equal(unknownEmail.status);
      expect(wrongPassword.body).to.deep.equal(unknownEmail.body);
    });
  });

  describe('TC-02-04 Protected endpoint called with a valid Bearer token', () => {
    it('should return 200 when the token comes from a successful login', async () => {
      const { body } = await login({ email: user.email, password: user.password });

      const res = await getTrips(`Bearer ${body.token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('TC-02-05 Protected endpoint called with no token, a malformed token or an expired token', () => {
    data.invalidToken.forEach(({ description, header, expectedStatus, expectedMessage }) => {
      it(`should return ${expectedStatus} when ${description}`, async () => {
        const res = await getTrips(header);

        expect(res.status).to.equal(expectedStatus);
        expect(res.body.message).to.equal(expectedMessage);
      });
    });

    data.alteredToken.forEach(
      ({ description, alteration, expectedStatus, expectedMessage, tag = '' }) => {
        it(`should return ${expectedStatus} when ${description}${tag ? ` ${tag}` : ''}`, async () => {
          const { body } = await login({ email: user.email, password: user.password });
          const tokens = {
            signature: withTamperedSignature(body.token),
            payload: withTamperedPayload(body.token, { id: 999999 }),
            none: `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${body.token.split('.')[1]}.`,
          };

          const res = await getTrips(`Bearer ${tokens[alteration]}`);

          expect(res.status).to.equal(expectedStatus);
          expect(res.body.message).to.equal(expectedMessage);
        });
      },
    );

    // The API signs tokens with JWT_SECRET, so the test needs the same value in its environment.
    // CI sets it for the whole workflow. Locally: JWT_SECRET=<value> npm test
    it('should return 401 when the token is expired', async function () {
      // eslint-disable-next-line mocha/no-pending-tests -- skipped only when JWT_SECRET is not set
      if (!process.env.JWT_SECRET) this.skip();
      const token = expiredToken(process.env.JWT_SECRET);

      const res = await getTrips(`Bearer ${token}`);

      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Invalid or expired token');
    });

    it('should return 401 when the token is signed with another secret', async () => {
      const now = Math.floor(Date.now() / 1000);
      const token = signToken(
        { id: 1, email: 'alice@example.com', exp: now + 3600 },
        'another-secret',
      );

      const res = await getTrips(`Bearer ${token}`);

      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Invalid or expired token');
    });
  });

  // Guardrails: these tests describe the expected behavior of open bugs and are
  // expected to FAIL until the bugs are fixed.
  describe('Guardrails for known bugs', () => {
    describe('@bug #44 BUG-003 Token issued before a new login', () => {
      it('should return 401 when the previous token is used after a new login', async () => {
        const first = await login({ email: user.email, password: user.password });
        await waitForNextSecond();
        const second = await login({ email: user.email, password: user.password });
        expect(second.body.token, 'the second login must issue a new token').to.not.equal(
          first.body.token,
        );

        const res = await getTrips(`Bearer ${first.body.token}`);

        expect(res.status).to.equal(401);
      });
    });

    describe('@bug #45 BUG-004 Authorization scheme', () => {
      ['Basic', 'qualquer'].forEach((scheme) => {
        it(`should return 401 when the scheme is ${scheme} instead of Bearer`, async () => {
          const { body } = await login({ email: user.email, password: user.password });

          const res = await getTrips(`${scheme} ${body.token}`);

          expect(res.status).to.equal(401);
        });
      });
    });

    describe('@bug #19 BUG-001 Oversized request body on login', () => {
      it('should return 413 when the request body exceeds the size limit', async () => {
        const res = await login({ email: 'a'.repeat(OVERSIZED_EMAIL_LENGTH), password: 'x' });

        expect(res.status).to.equal(413);
      });
    });
  });
});
