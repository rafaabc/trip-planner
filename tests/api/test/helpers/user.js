const UNIQUE_EMAIL_PLACEHOLDER = '{{uniqueEmail}}';

// The store is in memory and emails must be unique, so every run uses its own prefix.
const runId = Date.now();
let counter = 0;

function uniqueEmail(prefix = 'qa') {
  counter += 1;
  return `${prefix}.${runId}.${counter}@example.com`;
}

// Returns a copy of the fixture payload with the email placeholder replaced by a unique email.
function buildPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      value === UNIQUE_EMAIL_PLACEHOLDER ? uniqueEmail() : value,
    ]),
  );
}

module.exports = { uniqueEmail, buildPayload };
