// IMPORT REQUIRED MODULES
const mongodb = require('../models/db/connect-db');
const ObjectId = require('mongodb').ObjectId

const dbName = process.env.DB_NAME;  // store database name
const reviewsCollectionName = process.env.REVIEWS_COLLECTION;  // store name of user collection

// CREATE A REVIEW CONTROLLER OBJECT HOLDER
const reviewsController = {};

// Delete a review
reviewsController.deleteAReview = async function (req, res) {
    //#swagger.tags=['reviews routes']
    let reviewId;
    try {
        reviewId = new ObjectId(req.params.id);
        console.log(`reviewId: ${reviewId}`);  // for testing purpose
    } catch (err) {
        return res.status(500).send({ error: "error occured while getting object id", posibleReason: "invalid objectId" })
    }
    console.log(`reviewId: ${reviewId}`);

    try {
        const response = await mongodb.getDb().db(dbName).collection(reviewsCollectionName).deleteOne({ _id: reviewId });
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

module.exports = reviewsController;