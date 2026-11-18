const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const controller = require('../controllers/dashboard.controller');

router.get('/', auth, controller.overall);

module.exports = router;
