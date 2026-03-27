const express = require('express');
const HealthController = require('../controllers/healthController');

const router = express.Router();
const healthController = new HealthController();

router.get('/', (req, res) => healthController.check(req, res));

module.exports = router;
