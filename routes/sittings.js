const express = require('express');
const router = express.Router();
const sittingController = require('../controllers/sittingController');

router.get('/', sittingController.getAllSittingRequests);
// Fix null dates endpoint (must be before /:id route)
router.post('/fix-null-dates', sittingController.fixNullDates);
router.get('/:id', sittingController.getSittingRequestById);
// Detail alias route (some frontends call /details/:id)
router.get('/details/:id', sittingController.getSittingRequestById);
router.post('/', sittingController.createSittingRequest);
router.put('/:id', sittingController.updateSittingRequest);
router.delete('/:id', sittingController.deleteSittingRequest);

module.exports = router;
