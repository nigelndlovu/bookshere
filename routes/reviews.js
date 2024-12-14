// IMPORT REQUIRED MODULES
const express = require('express');
const authenticate = require('../middleware/authenticate');

// IMPORT CONTROLLER
const reviewsController = require('../controllers/reviews');

// SETUP EXPRESS ROUTER
const router = express.Router();

// Route to delete a review
router.delete('/:id',
    authenticate.checkLogin,
    authenticate.isAuthenticatedAdmin,
    reviewsController.deleteAReview
);

// EXPORT
module.exports = router;