const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const trips = require('../controllers/trip.controller');
const items = require('../controllers/budgetItem.controller');
const dashboard = require('../controllers/dashboard.controller');

router.use(auth);

router.get('/', trips.list);
router.post('/', trips.create);
router.get('/:tripId', trips.get);
router.put('/:tripId', trips.update);
router.delete('/:tripId', trips.remove);

router.get('/:tripId/dashboard', dashboard.forTrip);

router.get('/:tripId/items', items.list);
router.post('/:tripId/items', items.create);
router.get('/:tripId/items/:itemId', items.get);
router.put('/:tripId/items/:itemId', items.update);
router.delete('/:tripId/items/:itemId', items.remove);

module.exports = router;
