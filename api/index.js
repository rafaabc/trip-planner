// Vercel entrypoint. Locally the API starts through src/server.js, which seeds the in-memory
// store and calls listen(). On Vercel there is no listen(): the app is exported and the seed runs
// once per cold start, so the seed users exist in the deployed test environment.
require('../src/seed')();

module.exports = require('../src/app');
