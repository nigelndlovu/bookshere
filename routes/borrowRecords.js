// IMPORT REQUIRED MODULES
const express = require('express');
const authenticate = require('../middleware/authenticate');

// IMPORT CONTROLLER
const borrowRecordsController = require('../controllers/borrowRecords');

// SETUP EXPRESS ROUTER
const router = express.Router();

// Route to delete a borrow record
router.delete('/:id',
    authenticate.checkLogin,
    authenticate.isAuthenticatedAdmin,
    borrowRecordsController.deleteABorrowRecord
);

// EXPORT
module.exports = router;