const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all routes
// router.use(authenticate); // Uncomment if you want to protect all user routes

router.get('/', userController.getAllUsers);
router.get('/discover', userController.getUsersWithDetails);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
