const tripService = require('../services/trip.service');
const { handle, idParam } = require('./handler');

module.exports = {
  list: handle(200, (req) => tripService.list(req.user.id)),
  get: handle(200, (req) => tripService.get(req.user.id, idParam(req, 'tripId'))),
  create: handle(201, (req) => tripService.create(req.user.id, req.body)),
  update: handle(200, (req) => tripService.update(req.user.id, idParam(req, 'tripId'), req.body)),
  remove: handle(204, (req) => tripService.remove(req.user.id, idParam(req, 'tripId'))),
};
