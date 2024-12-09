// IMPORT REQUIRED MODULES
const mongodb = require('../models/db/connect-db');
const ObjectId = require('mongodb').ObjectId

const dbName = process.env.DB_NAME;  // store database name
const bookCollectionName = process.env.BOOK_COLLECTION;  // store name of user collection

// CREATE BOOK CONTROLLER OBJECT HOLDER
const bookController = {};

// Get all books
bookController.getAllbooks = async function (req, res) {
    //#swagger.tags=['book routes']
    try {
        const dataResult = await mongodb.getDb().db(dbName).collection(bookCollectionName).find();
        dataResult.toArray((err)=> {
            if (err) {
                logError(err);
                return res.status(400).json({message: err});
            }
        }).then((books) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(books);
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err} || "Error occured while trying to fetch all books");
    }
}

// Get a book by book id
bookController.getAbook = async function (req, res) {
    //#swagger.tags=['book routes']
    let bookId;
    try {
        bookId = new ObjectId(req.params.id);
        console.log(`bookId: ${bookId}`);  // for testing purpose
    } catch(err) {
        return res.status(500).send({ error: "error occured while getting object id", posibleReason: "invalid objectId" })
    }
    console.log(`bookId: ${bookId}`); // for debugging purpose

    try {
        const dataResult = await mongodb.getDb().db(dbName).collection(bookCollectionName).find({_id: bookId});
        dataResult.toArray((err)=> {
            if (err) {
                logError(err);
                return res.status(400).json({message: err});
            }
        }).then((book) => {
            // check if array is empty
            console.log(`books: ${book}`);  // for debugging purpose
            if (book == null || book == [] || book == '') {
                return res.status(404).json({message: `book with id: ${bookId}; Not found, or is empty`});
            }
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(book);
        })
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err} || `Error occured while trying to fetch book with id: ${bookId}`);
    }
}

// Create a book
bookController.addNewbook = async function (req, res) {
    //#swagger.tags=['book routes']    
    let bookObject = {
        title: req.body.title,
        author: req.body.author,
        genre: req.body.genre,
        publishedDate: req.body.publishedDate,
        summary: req.body.summary,
        totalCopies: req.body.totalCopies,
        availableCopies: req.body.availableCopies,
        addedAt : Date.now(),
        addedBy: req.session.user.displayName,
        librarian_id: req.session.user._id
    };

    try {
        const response = await mongodb.getDb().db(dbName).collection(bookCollectionName).insertOne(bookObject);
        if (response.acknowledged) {
            const msg = "new book added successfully";
            console.log(msg);  // testing purpose
            res.status(200).send({ message: msg });
        } else {
            const msg = "some error occurred while adding the book.";
            res.status(500).send(response.error || { message: msg });
        }
    } catch(err) {
        console.error(err);
        res.status(500).send(err || "error occured while adding book");
    }
}

// Update a book
bookController.updateAbook = async function (req, res) {
    //#swagger.tags=['book routes']

    // set id
    let bookId;
    try {
        bookId = new ObjectId(req.params.id);
        console.log(`bookId: ${bookId}`);  // for testing purpose
    } catch(err) {
        return res.status(500).send({ error: "error occured while getting object id", posibleReason: "invalid objectId" })
    }
    console.log(`bookId: ${bookId}`);

    let bookObject = {
        title: req.body.title,
        author: req.body.author,
        genre: req.body.genre,
        publishedDate: req.body.publishedDate,
        summary: req.body.summary,
        totalCopies: req.body.totalCopies,
        availableCopies: req.body.availableCopies,
    };

    try {
        // get the previouse user timestamp and add to updateTimestamp list, to be used for the update
        const dataResult = await mongodb.getDb().db(dbName).collection(bookCollectionName).find({ _id: bookId });
        dataResult.toArray((err) => {
            if (err) {
                logError(err);
                return res.status(400).json({ message: err });
            }
        }).then(async (book) => {
            // check if array is empty
            console.log(`book: ${JSON.stringify(book)}`);  // for debugging purpose
            if (book == null || book == [] || book == '') {
                return res.status(404).json({ message: `book with id: ${bookId}; Not found` });
            }
            // Add timestamp and updateTimestamp to Update bookObject
            // adding addedAt
            bookObject.addedAt = book[0].addedAt == undefined || book[0].addedAt == null ? Date.now() : book[0].addedAt;
            // adding updateInfo
            bookObject.updateInfo = book[0].updateInfo != undefined ? [...book[0].updateInfo, { librarain_id: req.session.user._id, librarain_name: req.session.user.displayName, updateTimestamp: Date.now() }] : [{ librarain_id: req.session.user._id, librarain_name: req.session.user.displayName, updateTimestamp: Date.now() }];
            console.log(`updatebookObject: ${JSON.stringify(bookObject)}`);  // for debugging purpose

            // update db with bookObject
            const response = await mongodb.getDb().db(dbName).collection(bookCollectionName).replaceOne({ _id: bookId }, bookObject);
            console.log(response);  // for visualizing and testing purpose
            if (response.acknowledged && response.modifiedCount > 0) {
                const msg = `book with book-id: ${bookId}; has been updated successfully`;
                console.log(msg);  // testing purpose
                res.status(200).send({ message: msg });
            } else {
                const msg = `fail to update book with book-id: ${bookId};\nPosible Error: Provided book id not found: ${bookId}`;
                console.log(msg);  // for testing purpose
                res.status(404).send({ message: msg });
            }
        })
    } catch (err) {
        console.error(err);
        res.status(500).send(err || "Error occured while updating book");
    }
}

// Delete a book
bookController.deleteAbook = async function (req, res) {
    //#swagger.tags=['book routes']
    let bookId;
    try {
        bookId = new ObjectId(req.params.id);
        console.log(`bookId: ${bookId}`);  // for testing purpose
    } catch(err) {
        return res.status(500).send({ error: "error occured while getting object id", posibleReason: "invalid objectId" })
    }
    console.log(`bookId: ${bookId}`);

    try {
        const response = await mongodb.getDb().db(dbName).collection(bookCollectionName).deleteOne({_id: bookId});
        console.log(response);  // for visualizing and testing purpose
        if (response.acknowledged && response.deletedCount > 0) {
            const msg = `book with book-id: ${bookId}; has been deleted successfully`;
            console.log(msg);  // testing purpose
            res.status(200).send({message: msg});
        } else {
            const msg = `fail to delete book with book-id: ${bookId};\nPosible Error: Provided book id not found: ${bookId}`;
            console.log(msg);  // for testing purpose
            res.status(404).send({message: msg});
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).send(err || "Error occured while deleting book");
    }
}

// EXPORT CONTROLLER

module.exports = bookController;