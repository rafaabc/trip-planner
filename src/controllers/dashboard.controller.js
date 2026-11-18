const dashboardService = require('../services/dashboard.service');
const { handle, idParam } = require('./handler');

module.exports = {
  overall: handle(200, (req) => dashboardService.forUser(req.user.id)),
  forTrip: handle(200, (req) => dashboardService.forTrip(req.user.id, idParam(req, 'tripId'))),
};
