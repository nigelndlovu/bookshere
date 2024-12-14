// IMPORT REQUIRED MODULES
const express = require('express');
const bookRoute = require('./book');
// const swaggerRoute = require('./swagger');
const userRoutes = require('./user');
const loginRoutes = require('./login');
const logoutRoute = require('./logout');
const reviewsRoute = require('./reviews');
const borrowRecordsRoute = require('./borrowRecords');

// IMPORT CONTROLLER
const baseController = require('../controllers')


// SETUP EXPRESS ROUTER
const router = express.Router();
// home route
router.get('/', baseController.displayHome);

// api-docs route
router.use('/', require('./swagger'));

// api-books route
router.use('/books', bookRoute);

// users route
router.use('/users', userRoutes);

// Login Routes
router.use('/login', loginRoutes);

// Logout
router.use('/logout', logoutRoute);

// Reviews Routes
router.use('/reviews', reviewsRoute);

// Borrow Records Routes
router.use('/borrowRecords', borrowRecordsRoute);



// EXPORT
module.exports = router;