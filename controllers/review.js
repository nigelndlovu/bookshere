// IMPORT REQUIRED MODULES
const mongodb = require('../models/db/connect-db');
const ObjectId = require('mongodb').ObjectId

const dbName = process.env.DB_NAME;  // store database name
const bookCollection = process.env.BOOK_COLLECTION;
const reviewCollection = process.env.REVIEW_COLLECTION;  // store name of user collection

// CREATE review CONTROLLER OBJECT HOLDER
const reviewController = {};

// Get all reviews
reviewController.getAllReviews = async function (req, res) {
    //#swagger.tags=['review routes']
    try {
        const dataResult = await mongodb.getDb().db(dbName).collection(reviewCollection).find();
        dataResult.toArray((err)=> {
            if (err) {
                logError(err);
                return res.status(400).json({message: err});
            }
        }).then((reviews) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(reviews);
        })
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err} || "Error occured while trying to fetch all reviews");
    }
}

// Get a review by review id
reviewController.getAReview = async function (req, res) {
    //#swagger.tags=['review routes']
    let reviewId;
    try {
        reviewId = new ObjectId(req.params.id);
        console.log(`reviewId: ${reviewId}`);  // for testing purpose
    } catch(err) {
        return res.status(500).send({ error: "error occured while getting object id", posibleReason: "invalid objectId" })
    }
    console.log(`reviewId: ${reviewId}`); // for debugging purpose

    try {
        const dataResult = await mongodb.getDb().db(dbName).collection(reviewCollection).find({_id: reviewId});
        dataResult.toArray((err)=> {
            if (err) {
                logError(err);
                return res.status(400).json({message: err});
            }
        }).then((review) => {
            // check if array is empty
            console.log(`reviews: ${review}`);  // for debugging purpose
            if (review == null || review == [] || review == '') {
                return res.status(404).json({message: `review with id: ${reviewId}; Not found, or is empty`});
            }
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(review);
        })
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err} || `Error occured while trying to fetch review with id: ${reviewId}`);
    }
}

reviewController.addNewReview = async function (req, res) {
    //#swagger.tags=['review routes']
    // verify book Id and get the book
    let bookId;
    try {
        bookId = new ObjectId(req.params.bookId);
        console.log(`reviewId: ${bookId}`);  // for testing purpose
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
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err } || `Error occured while trying to fetch book with id: ${bookId}`);
    }

    let reviewObject = {
        bookId: bookData._id,
        bookTitle: bookData.title,
        bookAuthor: bookData.author,
        reviewer: req.session.user.displayName,
        reviewerId: req.session.user._id,
        reviews: [
            {
                rating: req.body.rating,
                comment: req.body.comment == "" ? null : req.body.comment,
                reviewer: req.session.user.displayName,
                reviewerId: req.session.user._id,
                timestamp: Date.now()
            }
        ],
        createdAt: Date.now()
    };

    try {
        const response = await mongodb.getDb().db(dbName).collection(reviewCollection).insertOne(reviewObject);
        if (response.acknowledged) {
            res.status(200).send("Thank you for taking the time to make this review. We hope this review will be helpful to others.");
        } else {
            const msg = "some error occurred while adding the review. please try again.";
            res.status(500).send(response.error || { message: msg });
        }
    } catch(err) {
        console.error(err);
        res.status(500).send(err || "error occured while adding review. try again.");
    }
}

// update a review
reviewController.updateAReview = async function (req, res) {
    //#swagger.tags=['review routes']

    // verify book Id and get the book
    let reviewId;
    try {
        reviewId = new ObjectId(req.params.id);
        console.log(`reviewId: ${reviewId}`);  // for testing purpose
    } catch(err) {
        return res.status(500).send({ error: "error occured while getting object id", posibleReason: "invalid objectId" })
    }
    console.log(`reviewId: ${reviewId}`); // for debugging purpose

    // get book object
    let reviewData = '';
    try {
        const dataResult = await mongodb.getDb().db(dbName).collection(reviewCollection).findOne({_id: reviewId});
        // check if valid result was received
        if (dataResult && dataResult != null && dataResult != {} && dataResult != '' && dataResult != undefined) {
            reviewData = dataResult;
            console.log(reviewData);
        } else {
            return res.status(404).send({ message: "review record not fount!"});
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err } || `Error occured while trying to fetch review with id: ${reviewId}`);
    }
    
    // check if current reviewer Id is same as the reviewData id
    if (req.session.user._id != reviewData._id && req.session.user.accountType != "fullControl") {
        return res.status(401).send({message: "Sorry, you are not authorized to update this review.", reason: "You are not the owner of the review"});
    }

    // update reviewData
    if (reviewData.reviews != undefined) {
        reviewData.reviews.push({
            rating: req.body.rating,
            comment: req.body.comment == "" ? null : req.body.comment,
            reviewer: req.session.user.displayName,
            reviewerId: req.session.user._id,
            timestamp: Date.now()
        });
    } else {
        reviewData.reviews = [{
            rating: req.body.rating,
            comment: req.body.comment == "" ? null : req.body.comment,
            reviewer: req.session.user.displayName,
            reviewerId: req.session.user._id,
            timestamp: Date.now()
        }];
    }

    try {
        const response = await mongodb.getDb().db(dbName).collection(reviewCollection).replaceOne({ _id: reviewId}, reviewData);
        if (response.acknowledged) {
            res.status(200).send("Thank you for taking the time to update this review. We hope this review will be helpful to others.");
        } else {
            const msg = "some error occurred while updating the review. please try again.";
            res.status(500).send(response.error || { message: msg });
        }
    } catch(err) {
        console.error(err);
        res.status(500).send(err || "error occured while updating review. try again.");
    }
}

// Delete a review
reviewController.deleteAReview = async function (req, res) {
    //#swagger.tags=['review routes']
    let reviewId;
    try {
        reviewId = new ObjectId(req.params.id);
        console.log(`reviewId: ${reviewId}`);  // for testing purpose
    } catch (err) {
        return res.status(500).send({ error: "error occured while getting object id", posibleReason: "invalid objectId" })
    }
    console.log(`reviewId: ${reviewId}`);

    try {
        const response = await mongodb.getDb().db(dbName).collection(reviewCollection).deleteOne({ _id: reviewId });
        console.log(response);  // for visualizing and testing purpose
        if (response.acknowledged && response.deletedCount > 0) {
            const msg = `review with review-id: ${reviewId}; has been deleted successfully`;
            console.log(msg);  // testing purpose
            res.status(200).send({ message: msg });
        } else {
            const msg = `fail to delete review with review-id: ${reviewId};\nPosible Error: Provided review id not found: ${reviewId}`;
            console.log(msg);  // for testing purpose
            res.status(404).send({ message: msg });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(err || "Error occured while deleting the review");
    }
}

// EXPORT CONTROLLER

module.exports = reviewController;