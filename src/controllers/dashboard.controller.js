const dashboardService = require('../services/dashboard.service');
const { handle, idParam } = require('./handler');

module.exports = {
  forTrip: handle(200, (req) => dashboardService.forTrip(req.user.id, idParam(req, 'tripId'))),
};
