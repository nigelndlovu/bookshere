// IMPORT REQUIRED MODULES
const mongodb = require('../models/db/connect-db');
const ObjectId = require('mongodb').ObjectId

const dbName = process.env.DB_NAME;  // store database name
const borrowRecordsCollectionName = process.env.BORROWRECORDS_COLLECTION;  // store name of user collection

// CREATE A BORROW RECORD CONTROLLER OBJECT HOLDER
const borrowRecordsController = {};

// Delete a borrow record
borrowRecordsController.deleteABorrowRecord = async function (req, res) {
    //#swagger.tags=['borrowRecords routes']
    let borrowRecordId;
    try {
        borrowRecordId = new ObjectId(req.params.id);
        console.log(`borrowRecordId: ${borrowRecordId}`);  // for testing purpose
    } catch (err) {
        return res.status(500).send({ error: "error occured while getting object id", posibleReason: "invalid objectId" })
    }
    console.log(`borrowRecordId: ${borrowRecordId}`);

    try {
        const response = await mongodb.getDb().db(dbName).collection(borrowRecordsCollectionName).deleteOne({ _id: borrowRecordId });
        console.log(response);  // for visualizing and testing purpose
        if (response.acknowledged && response.deletedCount > 0) {
            const msg = `record with borrowRecord-id: ${borrowRecordId}; has been deleted successfully`;
            console.log(msg);  // testing purpose
            res.status(200).send({ message: msg });
        } else {
            const msg = `fail to delete borrow record with borrowRecord-id: ${borrowRecordId};\nPosible Error: Provided borrow record id not found: ${borrowRecordId}`;
            console.log(msg);  // for testing purpose
            res.status(404).send({ message: msg });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(err || "Error occured while deleting the borrow record");
    }
}

// EXPORT CONTROLLER

module.exports = borrowRecordsController;