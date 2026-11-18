const authService = require('../services/auth.service');
const { handle } = require('./handler');

module.exports = {
  register: handle(201, (req) => authService.register(req.body)),
  login: handle(200, (req) => authService.login(req.body)),
};
