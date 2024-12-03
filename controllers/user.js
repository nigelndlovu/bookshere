// IMPORT REQUIRED MODULES
const mongodb = require('../models/db/connect-db');
const bcrypt = require('bcryptjs');

// CONSTANTS
const dbName = process.env.DB_NAME;  // store database name
const userCollectionName = process.env.USER_COLLECTION;  // store name of user collection


// CREATE User CONTROLLER OBJECT HOLDER
const userController = {};

// Get all Users
userController.getAllUsers = async function(req, res) {
    //#swagger.tags=['User routes']

}

// Get a User by User id
userController.getAUser = async function(req, res) {
    //#swagger.tags=['User routes']
    
}

// Create a User
userController.addNewUser = async function(req, res) {
    //#swagger.tags=['User routes']
    
}

// Find/Create a user that is provided through oAuthProvider
userController.findOrCreateOAuthProviderProfile = async function(oAuthProviderNameAndIdObject, profile) {
    //#swagger.tags=['User routes']
    // check and create profile based on oAuthProvider
    if (oAuthProviderNameAndIdObject.oAuthProvider == 'github') {
        // find id in db where provider is github and userProfile id is same
        const profileObject = {
            firstname: profile.displayName.split(' ')[0],
            lastname: profile.displayName.split(' ')[profile.displayName.split(' ').length - 1],
            email: profile._json.email ? profile._json.email : null,
            profilePhotoUrl : profile.photos[0].value ? profile.photos[0].value : null,
            bio: profile._json.bio ? profile._json.bio : null,
            username: null,
            password: null,
            oAuthProvider: profile.provider,
            providerUserId : profile.id,
            accountType: 'user',
            createdAt : Date.now()
        }
        return await findOrCreate(oAuthProviderNameAndIdObject, profileObject);
    }

    // find or create profile
    async function findOrCreate(object, profileObject) {
        try {
            const usersDb = mongodb.getDb().db(dbName).collection(userCollectionName);
            const find = await usersDb.findOne({ oAuthProvider: object.oAuthProvider, providerUserId: object.profileId });
            console.log(find);  // for visualizing and testing purpose
            if (!find) {
                const response = await usersDb.insertOne(profileObject);  // if _id is not present. _id will be added to the object
                if (response.acknowledged) {
                    const msg = "new oAuthProvider user added successfully";
                    console.log(msg);  // testing purpose
                    // add displayName to profileObject
                    profileObject.displayName = `${profileObject.firstname.slice(0, 1).toUpperCase()}${profileObject.firstname.slice(1)} ${profileObject.lastname.slice(0, 1).toUpperCase()}${profileObject.lastname.slice(1)}`;  // add display name;
                    return { status: 201, find: false, userData: profileObject, message: msg };
                } else {
                    const msg = "fail to add new user";
                    console.log(msg);  // for testing purpose
                    return { status: 500, find: false, userData: find, message: msg };
                }
            }
            const msg = "Profile already exist.";
            console.log(msg);  // for testing purpose;
            find.displayName = `${find.firstname.slice(0, 1).toUpperCase()}${find.firstname.slice(1)} ${find.lastname.slice(0, 1).toUpperCase()}${find.lastname.slice(1)}`;  // add display name;
            return { status: 200, found: true, userData: find, message: msg };
        } catch (err) {
            console.error(err);
            return message = { status: 500, found: false, userData: '', message: err} || "Error occured while trying to find or create new user";
        }
    }
}

// Update a User
userController.updateAUser = async function(req, res) {
    //#swagger.tags=['User routes']
    
}

// Delete a User
userController.deleteAUser = async function(req, res) {
    //#swagger.tags=['User routes']

}

// EXPORT CONTROLLER

module.exports = userController;