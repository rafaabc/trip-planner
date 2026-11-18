const itemService = require('../services/budgetItem.service');
const { handle, idParam } = require('./handler');

module.exports = {
  list: handle(200, (req) => itemService.list(req.user.id, idParam(req, 'tripId'))),
  get: handle(200, (req) =>
    itemService.get(req.user.id, idParam(req, 'tripId'), idParam(req, 'itemId'))
  ),
  create: handle(201, (req) => itemService.create(req.user.id, idParam(req, 'tripId'), req.body)),
  update: handle(200, (req) =>
    itemService.update(req.user.id, idParam(req, 'tripId'), idParam(req, 'itemId'), req.body)
  ),
  remove: handle(204, (req) =>
    itemService.remove(req.user.id, idParam(req, 'tripId'), idParam(req, 'itemId'))
  ),
};
