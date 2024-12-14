// IMPORT REQUIRED MODULES
const express = require('express');
const authenticate = require('../middleware/authenticate');
const validateReview = require('../middleware/validation/review-validation');

// IMPORT CONTROLLER
const reviewController = require('../controllers/review');

// SETUP EXPRESS ROUTER
const router = express.Router();

// Route to get all review
router.get('/', 
    authenticate.checkLogin,
    authenticate.isAuthenticatedAdmin,
    reviewController.getAllReviews
)

// Route to get a review
router.get('/:id',
    authenticate.checkLogin,
    authenticate.isAuthenticatedAdmin,
    reviewController.getAReview
)

// Route to add a review
router.post('/:bookId',
    authenticate.checkLogin,
    validateReview.addReviewRules(),
    validateReview.checkReview,
    reviewController.addNewReview
)

// Route to update a review
router.put('/:id',
    authenticate.checkLogin,
    validateReview.updateReviewRules(),
    validateReview.checkReview,
    reviewController.updateAReview
)

// Route to delete a review
router.delete('/:id',
    authenticate.checkLogin,
    authenticate.isAuthenticatedAdmin,
    reviewController.deleteAReview
);

// EXPORT
module.exports = router;