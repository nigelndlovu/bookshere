// IMPORT REQUIRED MODULES
const express = require('express');
const validatebook = require('../middleware/validation/book-validation');
const authenticate = require('../middleware/authenticate');

// IMPORT CONTROLLER
const bookController = require('../controllers/book');


// SETUP EXPRESS ROUTER
const router = express.Router();

// Route to get all books
// router.get('/', bookController.getAllbooks);

// Route to get book by id
// router.get('/:id', bookController.getAbook)

// Route to add new book
// router.post('/',
//     bookController.addNewbook
// );

// Route to update a book
// router.put('/:id',
//     bookController.updateAbook
// );

// Route to delete a book
// router.delete('/:id',
//     bookController.deleteAbook
// );


// EXPORT
module.exports = router;