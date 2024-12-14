// IMPORT REQUIRED MODULES
const express = require('express');
const bookRoute = require('./book');
// const swaggerRoute = require('./swagger');
const userRoutes = require('./user');
const loginRoutes = require('./login');
const logoutRoute = require('./logout');
const borrowRoute = require('./borrowRecord');
const reviewRoute = require('./review');

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

// borrow route
router.use('/borrow', borrowRoute);

// review route
// router.use('/review', reviewRoute);

// users route
router.use('/users', userRoutes);

// Login Routes
router.use('/login', loginRoutes);

// Logout
router.use('/logout', logoutRoute);



// EXPORT
module.exports = router;