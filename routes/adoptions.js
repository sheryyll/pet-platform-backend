const express = require('express');
const router = express.Router();
const adoptionController = require('../controllers/adoptionController');

router.get('/', adoptionController.getAllAdoptionRequests);
router.get('/:id', adoptionController.getAdoptionRequestById);
router.post('/', adoptionController.createAdoptionRequest);
router.put('/:id', adoptionController.updateAdoptionRequest);
router.delete('/:id', adoptionController.deleteAdoptionRequest);

module.exports = router;
