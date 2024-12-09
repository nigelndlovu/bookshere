// IMPORT MODULES
const mongodb = require('../models/db/connect-db');
const jwt = require("jsonwebtoken");
const ObjectId = require('mongodb').ObjectId


// CONSTANTS
const accountTypes = ['user', 'admin', 'fullControl'];
const adminRight = [accountTypes[1], accountTypes[2]];
const fullControlRight = [accountTypes[2]];

const dbName = process.env.DB_NAME;  // store database name
const userCollectionName = process.env.USER_COLLECTION;  // store name of user collection

const authenticate = {};

authenticate.checkLogin = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        return res.status(401).json({ message: "You are not logged in. Please login to procceed." });
    }
}


// authenticate user adminRight
authenticate.isAuthenticatedAdmin = async (req, res, next) => {
    // console.log(req.session.user);  // for testing purpose
    // if (!adminRight.includes(req.session.user.accountType)) {
    //     return res.status(401).json({ message: "Require admin right: You don't have access." });
    // }
    // console.log(`Session User Plain: ${JSON.stringify(req.session.user)}`);

    // Using Data From DB to Authenticate User Right for real-time check incase of update of accountType (add async to the function)
    try {
        const userId = new ObjectId(req.session.user._id);
        const usersDb = mongodb.getDb().db(dbName).collection(userCollectionName);
        const userData = await usersDb.findOne({ _id: userId });
        console.log(userData);  // for visualizing and testing purpose
        if (userData) {
            // authenticate using accountType in userData
            console.log(`accountType: ${userData.accountType}`);  // for debugging purpose
            if (!adminRight.includes(userData.accountType)) {
                return res.status(401).json({ message: "Require admin right: You don't have access." });
            }
        } else {
            return res.status(400).json({ message: 'unable to get user accountType' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err });
    }

    next();
};

// authenticate for fullControlRight
// authenticate user admin right (accountType)
authenticate.isAuthenticatedFullControl = async (req, res, next) => {
    // console.log(req.session.user);  // for testing purpose
    // if (!fullControlRight.includes(req.session.user.accountType)) {
    //     return res.status(401).json({ message: "Require full-control right: You don't have access." });
    // }
    // console.log(`Session User Plain: ${JSON.stringify(req.session.user)}`);

    // Using Data From DB to Authenticate User Right for real-time check incase of update of accountType (add async to the function)
    try {
        const userId = new ObjectId(req.session.user._id);
        const usersDb = mongodb.getDb().db(dbName).collection(userCollectionName);
        const userData = await usersDb.findOne({ _id: userId });
        console.log(userData);  // for visualizing and testing purpose
        if (userData) {
            // authenticate using accountType
            if (!fullControlRight.includes(userData.accountType)) {
                return res.status(401).json({ message: "Require full-control right: You don't have access." });
            }
        } else {
            return res.status(400).json({ message: 'unable to get user accountType' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err });
    }

    next();
};

/* ****************************************************
* Middleware to check token validity
**************************************************** */
authenticate.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify (
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, user) {
                if (err) {
                    res.clearCookie("jwt")
                    return res.status(400).json({ message: "Please login to proceed." });
                }
                console.log(`JWT USER: ${JSON.stringify(user)}`);  // for testing purpose;
                req.session.user = user
                next()
            })
    } else {
        next()
    }
}

module.exports = authenticate;