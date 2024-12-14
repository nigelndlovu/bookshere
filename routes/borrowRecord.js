// IMPORT REQUIRED MODULES
const express = require('express');
const validateRecord = require('../middleware/validation/borrowRecord-validation');
const authenticate = require('../middleware/authenticate');

// IMPORT CONTROLLER
const borrowRecordController = require('../controllers/borrowRecord');


// SETUP EXPRESS ROUTER
const router = express.Router();

// get all borrow records
router.get('/',
    authenticate.checkLogin,
    authenticate.isAuthenticatedAdmin,
    borrowRecordController.getAllRecords
);

// get a borrow record
router.get('/:id',
    authenticate.checkLogin,
    authenticate.isAuthenticatedAdmin,
    borrowRecordController.getARecord
);

// create a borrow record
router.post('/:bookId',
    authenticate.checkLogin,
    validateRecord.addNewRecordRules(),
    validateRecord.checkRecord,
    borrowRecordController.addNewRecord
);

// update a borrow record
router.put('/:id',
    authenticate.checkLogin,
    validateRecord.updateRecordRules(),
    validateRecord.checkRecord,
    borrowRecordController.updateARecord
);

// pay fine on penalized borrow record
router.put('pay-fine/:id',
    authenticate.checkLogin,
    validateRecord.payFineRules(),
    validateRecord.checkRecord,
    borrowRecordController.payFine
);

// Route to delete a borrow record
router.delete('/:id',
    authenticate.checkLogin,
    authenticate.isAuthenticatedAdmin,
    borrowRecordController.deleteARecord
);


// EXPORT
module.exports = router;