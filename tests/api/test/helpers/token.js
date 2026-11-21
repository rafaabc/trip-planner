const crypto = require('crypto');

const base64url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

// Builds an HS256 JWT by hand, so the tests do not need an extra dependency.
// The secret must be the same JWT_SECRET the API runs with (set it in the environment).
function signToken(payload, secret) {
  const header = base64url({ alg: 'HS256', typ: 'JWT' });
  const body = base64url(payload);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

// A token signed with the correct secret whose exp is already in the past.
function expiredToken(secret, claims = { id: 1, email: 'alice@example.com' }) {
  const now = Math.floor(Date.now() / 1000);
  return signToken({ ...claims, iat: now - 7200, exp: now - 3600 }, secret);
}

// Same token with the last character of the signature changed.
function withTamperedSignature(token) {
  const last = token.slice(-1);
  return `${token.slice(0, -1)}${last === 'A' ? 'B' : 'A'}`;
}

// Same token with a different payload and the original signature.
function withTamperedPayload(token, changes) {
  const [header, payload, signature] = token.split('.');
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  return `${header}.${base64url({ ...decoded, ...changes })}.${signature}`;
}

module.exports = { signToken, expiredToken, withTamperedSignature, withTamperedPayload };
