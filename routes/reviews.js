const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Specific routes must be before generic /:id route
// Get reviews for a specific pet
router.get('/pets/:id', reviewController.getReviewsForPet);

// Get reviews for a specific sitter
router.get('/sitters/:id', reviewController.getReviewsForSitter);

// Get combined reviews (pet + sitter)
router.get('/combined/:petId/:sitterId', reviewController.getCombinedReviews);

// Get all reviews
router.get('/', reviewController.getAllReviews);

// Get review by ID
router.get('/:id', reviewController.getReviewById);

// Create review for pet
router.post('/pets', reviewController.createPetReview);

// Create review for sitter
router.post('/sitters', reviewController.createSitterReview);

// Create combined review (pet + sitter)
router.post('/combined', reviewController.createCombinedReview);

// Update review
router.put('/:id', reviewController.updateReview);

// Delete review
router.delete('/:id', reviewController.deleteReview);

module.exports = router;

