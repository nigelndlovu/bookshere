// IMPORT REQUIRED MODULES
const mongodb = require('../models/db/connect-db');

const dbName = process.env.DB_NAME;  // store database name
const userCollectionName = process.env.USER_COLLECTION;  // store name of user collection

// CREATE BOOK CONTROLLER OBJECT HOLDER
const bookController = {};

// Get all books
bookController.getAllbooks = async function(req, res) {
    //#swagger.tags=['book routes']
    
}

// Get a book by book id
bookController.getAbook = async function(req, res) {
    //#swagger.tags=['book routes']
    
}

// Create a book
bookController.addNewbook = async function(req, res) {
    //#swagger.tags=['book routes']
    
}

// Update a book
bookController.updateAbook = async function(req, res) {
    //#swagger.tags=['book routes']

}

// Delete a book
bookController.deleteAbook = async function(req, res) {
    //#swagger.tags=['book routes']

}

// EXPORT CONTROLLER

module.exports = bookController;