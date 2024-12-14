// IMPORT REQUIRED MODULES
const mongodb = require('../models/db/connect-db');
const crypto = require('crypto');
const ObjectId = require('mongodb').ObjectId

const dbName = process.env.DB_NAME;  // store database name
const borrowCollection = process.env.BORROW_COLLECTION;  // store name of borrow collection
const bookCollection = process.env.BOOK_COLLECTION;

// CREATE record CONTROLLER OBJECT HOLDER
const borrowController = {};

// get all borrow records
borrowController.getAllRecords = async function (req, res) {
    //#swagger.tags=['borrow-record route']
    try {
        const dataResult = await mongodb.getDb().db(dbName).collection(borrowCollection).find();
        dataResult.toArray((err)=> {
            if (err) {
                logError(err);
                return res.status(400).json({message: err});
            }
        }).then((records) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(records);
        })
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err} || "Error occured while trying to fetch all records");
    }
}

// get a record
borrowController.getARecord = async function (req, res) {
    //#swagger.tags=['borrow-record route']
    let recordId;
    try {
        recordId = new ObjectId(req.params.id);
        console.log(`recordId: ${recordId}`);  // for testing purpose
    } catch(err) {
        return res.status(500).send({ error: "error occured while getting object id", posibleReason: "invalid objectId" })
    }
    console.log(`recordId: ${recordId}`); // for debugging purpose

    try {
        const dataResult = await mongodb.getDb().db(dbName).collection(borrowCollection).find({_id: recordId});
        dataResult.toArray((err)=> {
            if (err) {
                logError(err);
                return res.status(400).json({message: err});
            }
        }).then((record) => {
            // check if array is empty
            console.log(`records: ${record}`);  // for debugging purpose
            if (record == null || record == [] || record == '') {
                return res.status(404).json({message: `record with id: ${recordId}; Not found, or is empty`});
            }
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(record);
        })
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err } || `Error occured while trying to fetch record with id: ${recordId}`);
    }
}

// create a record
borrowController.addNewRecord = async function (req, res) {
    //#swagger.tags=['borrow-record route']
    // verify book Id and get the book
    let bookId;
    try {
        bookId = new ObjectId(req.params.bookId);
        console.log(`recordId: ${bookId}`);  // for testing purpose
    } catch(err) {
        return res.status(500).send({ error: "error occured while getting object id", posibleReason: "invalid objectId" })
    }
    console.log(`bookId: ${bookId}`); // for debugging purpose

    // get book object
    let bookData = '';
    try {
        const dataResult = await mongodb.getDb().db(dbName).collection(bookCollection).findOne({_id: bookId});
        // check if valid result was received
        if (dataResult && dataResult != null && dataResult != {} && dataResult != '' && dataResult != undefined) {
            bookData = dataResult;
            console.log(bookData);
        } else {
            return res.status(404).send({ message: "book not fount!"});
        }
        // check if book is still available
        if (dataResult.availableCopies == 0) {
            return res.status(400).send({ message: "There is no more available copy for this book." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err } || `Error occured while trying to fetch record with id: ${bookId}`);
    }

    let recordObject = {
        bookId: bookData._id,
        bookTitle: bookData.title,
        bookAuthor: bookData.author,
        bookGenre: bookData.genre,
        borrowedBy: req.session.user.displayName,
        borrowerId: req.session.user._id,
        borrowDate: new Date(Date.now()),
        returnDate: req.body.returnDate + 'T24:00:00.000+00:00',  // to complete 24 hours of that day
        acknowledgePenalty: req.body.acknowledgePenalty,
        returnId: crypto.randomInt(1000000, 9999999),
        isReturned: false,
    };

    try {
        const response = await mongodb.getDb().db(dbName).collection(borrowCollection).insertOne(recordObject);
        if (response.acknowledged) {
            // update book availableCopies count
            bookData.availableCopies = bookData.availableCopies - 1;
            try {
                // update book availableCopies count
                const updateResult = await mongodb.getDb().db(dbName).collection(bookCollection).replaceOne({ _id: bookData._id }, bookData);
                if (updateResult.acknowledged && updateResult.modifiedCount > 0) {
                    // create value from recordObject to be used for borrowCard
                    delete recordObject.returnId;
                    delete recordObject.penalise;
                    delete recordObject.isReturned;
                    // create return message object values
                    const msg = "new record added successfully";
                    const card = recordObject
                    const note = `You are to return this book on or before ${recordObject.returnDate}, which is the return date to avoid being penalised.`;

                    console.log(msg);  // for testing purpose
                    console.log(card);  // for testing purpose
                    console.log(note);  // for testing purpose

                    res.status(200).send({ message: msg, borrowCard: card, note: note});
                } else {
                    console.log(updateResult.error);
                    // removed added record in borrow record
                    const response = await mongodb.getDb().db(dbName).collection(borrowCollection).deleteOne({_id: recordObject._id});
                    if (response.acknowledged && response.deletedCount > 0) {
                        const msg = `There was an error updating book availableRecords. Please try again.`;
                        console.log(msg);  // testing purpose
                        res.status(200).send({message: msg});
                    } else {
                        const msg = `New borrow record was created, but there was an error updating book availableRecords.`;
                        console.log(msg);  // for testing purpose
                        res.status(404).send({message: msg});
                    }
                }
            } catch (err) {
                res.status(500).send(err);
            }
        } else {
            const msg = "some error occurred while adding the record. please try again.";
            res.status(500).send(response.error || { message: msg });
        }
    } catch(err) {
        console.error(err);
        res.status(500).send(err || "error occured while adding record. try again.");
    }
}

// update a record
borrowController.updateARecord = async function (req, res) {
    //#swagger.tags=['borrow-record route']

    // set id
    const returnId = req.body.returnId;
    let recordId;
    try {
        recordId = new ObjectId(req.params.id);
        console.log(`recordId: ${recordId}`);  // for testing purpose
    } catch(err) {
        return res.status(500).send({ error: "error occured while getting object id", posibleReason: "invalid objectId" })
    }
    console.log(`recordId: ${recordId}`);

    try {
        const dataResult = await mongodb.getDb().db(dbName).collection(borrowCollection).findOne({_id: recordId});
        // check if valid result was received
        if (dataResult && dataResult != null && dataResult != {} && dataResult != '' && dataResult != undefined) {
            const recordData = dataResult;
            console.log(recordData);  // for testing purpose

            // validate returnId in data
            if (recordData.returnId != returnId) {
                return res.status(400).send("Invalid returnId: Please, check the return id, and try again.");
            }

            // check if book has been returned
            if (recordData.isReturned) {
                return res.status(400).send(`This book has already been returned by ${recordData.returnedBy}. Thanks for using our service`);
            }

            // get book object
            const bookId = recordData.bookId;
            let bookData = '';
            try {
                const dataResult = await mongodb.getDb().db(dbName).collection(bookCollection).findOne({_id: bookId});
                // check if valid result was received
                if (dataResult && dataResult != null && dataResult != {} && dataResult != '' && dataResult != undefined) {
                    bookData = dataResult;
                    console.log(bookData);  // for testing purpose
                } else {
                    return res.status(404).send({ message: "record found but there is a problem retreving borrowed book."});
                }
            } catch (err) {
                console.error(err);
                res.status(500).send({ message: err } || `Error occured while trying to fetch record with id: ${bookId}`);
            }

            let recordObject = {
                bookId: bookData._id,
                bookTitle: bookData.title,
                bookAuthor: bookData.author,
                bookGenre: bookData.genre,
                borrowedBy: recordData.borrowedBy,
                borrowerId: recordData.borrowerId,
                borrowDate: recordData.borrowDate,
                returnDate: recordData.returnDate,
                acknowledgePenalty: recordData.acknowledgePenalty,
                isReturned: true,
                returnId: returnId,
                returnedBy: req.session.user.displayName,
                returnerId: req.session.user._id,
                actualReturnDate: new Date(Date.now()),
                penalise: new Date(recordData.returnDate).getTime() < Date.now() ? true : false
            };
            if (recordObject.penalise) {
                recordObject.finePayed  = false;
                recordObject.fineId = crypto.randomInt(1000000, 9999999);
            }
            

            try {
                const response = await mongodb.getDb().db(dbName).collection(borrowCollection).replaceOne({ _id: recordId }, recordObject);
                if (response.acknowledged) {
                    // update book availableCopies count
                    bookData.availableCopies = bookData.availableCopies + 1;
                    try {
                        // update book availableCopies count
                        const updateResult = await mongodb.getDb().db(dbName).collection(bookCollection).replaceOne({ _id: bookData._id }, bookData);
                        if (updateResult.acknowledged && updateResult.modifiedCount > 0) {
                            // create value from recordObject to be used for borrowCard
                            let note = "Thank you for returning your book as promised. Nice having you here!";
                            if (recordObject.penalise) {
                                delete recordObject.finePayed;
                                delete recordObject.fineId;
                                note = "You are to pay a fine as requested! Why did you return it late? You know, integrety pay alot right? Just learn that.";
                            }
                            // create return message object valuesd
                            const msg = "record updated successfully";
                            const card = recordObject
                            res.status(200).send({ message: msg, borrowCard: card, note: note});
                        } else {
                            console.log(updateResult.error);
                            // removed added record in borrow record
                            const response = await mongodb.getDb().db(dbName).collection(borrowCollection).deleteOne({_id: recordObject._id});
                            if (response.acknowledged && response.deletedCount > 0) {
                                const msg = `There was an error updating book availableRecords. Please try again.`;
                                console.log(msg);  // testing purpose
                                res.status(200).send({message: msg});
                            } else {
                                const msg = `borrow record was updated, but there was an error updating book availableRecords.`;
                                console.log(msg);  // for testing purpose
                                res.status(404).send({message: msg});
                            }
                        }
                    } catch (err) {
                        res.status(500).send(err || 'There was an error updating bookAvailable copies.');
                    }
                } else {
                    const msg = "some error occurred while updating the record. please try again.";
                    res.status(500).send(response.error || { message: msg });
                }
            } catch(err) {
                console.error(err);
                res.status(500).send(err || "error occured while updating record. try again.");
            }
        } else {
            return res.status(404).send({ message: "borrow record not fount!"});
        }
    } catch (error) {
        return res.status(500).send(error);
    }
}

// update a record
borrowController.payFine = async function (req, res) {
    //#swagger.tags=['borrow-record route']

    // set id
    const fineId = req.body.fineId;
    let recordId;
    try {
        recordId = new ObjectId(req.params.id);
        console.log(`recordId: ${recordId}`);  // for testing purpose
    } catch(err) {
        return res.status(500).send({ error: "error occured while getting object id", posibleReason: "invalid objectId" })
    }
    console.log(`recordId: ${recordId}`);

    try {
        const dataResult = await mongodb.getDb().db(dbName).collection(borrowCollection).findOne({_id: recordId});
        // check if valid result was received
        if (dataResult && dataResult != null && dataResult != {} && dataResult != '' && dataResult != undefined) {
            const recordData = dataResult;
            console.log(recordData);  // for testing purpose

            // validate is fine is required
            if (recordData.fineId == undefined) {
                return res.status(400).send("This is no fine to be payed on this record. Please verify the record Id.");
            }

            // validate returnId in data
            if (recordData.fineId != fineId) {
                return res.status(400).send("Invalid fineId: Please, check the fine id, and try again.");
            }

            // check if book has been returned
            if (recordData.finePayed) {
                return res.status(400).send(`This fine has already been payed by ${recordData.payedBy}. Thanks for using our service`);
            }

            let recordObject = {
                bookId: recordData.bookId,
                bookTitle: recordData.bookTitle,
                bookAuthor: recordData.bookAuthor,
                bookGenre: recordData.bookGenre,
                borrowedBy: recordData.borrowedBy,
                borrowerId: recordData.borrowerId,
                borrowDate: recordData.borrowDate,
                returnDate: recordData.returnDate,
                acknowledgePenalty: recordData.acknowledgePenalty,
                isReturned: recordData.isReturned,
                returnId: recordData.returnId,
                returnedBy: recordData.returnedBy,
                returnerId: recordData.returnerId,
                actualReturnDate: recordData.actualReturnDate,
                penalise: recordData.penalise,
                fineId: recordData.fineId,
                finePayed: true,
                payedBy: req.session.user.displayName,
                payerId: req.session.user._id,
            };

            try {
                const response = await mongodb.getDb().db(dbName).collection(borrowCollection).replaceOne({ _id: recordId }, recordObject);
                if (response.acknowledged) {
                    // create return message object values
                    const msg = "record updated successfully";
                    const card = recordObject
                    const note = "Your record has been updated successfully. Thank you for using our service.";
                    res.status(200).send({ message: msg, borrowCard: card, note: note});
                } else {
                    const msg = "some error occurred while updating the record. please try again.";
                    res.status(500).send(response.error || { message: msg });
                }
            } catch(err) {
                console.error(err);
                res.status(500).send(err || "error occured while updating record. try again.");
            }
        } else {
            return res.status(404).send({ message: "borrow record not fount!"});
        }
    } catch (error) {
        return res.status(500).send(error);
    }
}

// delete a record
borrowController.deleteARecord = async function (req, res) {
    //#swagger.tags=['borrow-record route']
    let recordId;
    try {
        recordId = new ObjectId(req.params.id);
        console.log(`recordId: ${recordId}`);  // for testing purpose
    } catch(err) {
        return res.status(500).send({ error: "error occured while getting object id", posibleReason: "invalid objectId" })
    }
    console.log(`recordId: ${recordId}`);

    try {
        const response = await mongodb.getDb().db(dbName).collection(borrowCollection).deleteOne({_id: recordId});
        console.log(response);  // for visualizing and testing purpose
        if (response.acknowledged && response.deletedCount > 0) {
            const msg = `Borrow-record with record-id: ${recordId}; has been deleted successfully`;
            console.log(msg);  // testing purpose
            res.status(200).send({message: msg});
        } else {
            const msg = `fail to delete borrow-record with record-id: ${recordId};\nPosible Error: Provided record id not found: ${recordId}`;
            console.log(msg);  // for testing purpose
            res.status(404).send({message: msg});
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).send(err || "Error occured while deleting borrow-record");
    }
}

// EXPORT CONTROLLER

module.exports = borrowController;