const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');

// GET /api/availability/sitters/:id
router.get('/sitters/:id', availabilityController.getSitterAvailability);

module.exports = router;


