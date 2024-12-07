// IMPORT REQUIRED MODULES
const mongodb = require('../models/db/connect-db');
const bcrypt = require('bcryptjs');
const ObjectId = require('mongodb').ObjectId;

// CONSTANTS
const dbName = process.env.DB_NAME;  // store database name
const userCollectionName = process.env.USER_COLLECTION;  // store name of user collection


// CREATE User CONTROLLER OBJECT HOLDER
const userController = {};

// Get all Users
userController.getAllUsers = async function(req, res) {
    //#swagger.tags=['User routes']
    try {
        const dataResult = await mongodb.getDb().db(dbName).collection(userCollectionName).find();
        dataResult.toArray((err)=> {
            if (err) {
                logError(err);
                return res.status(400).json({message: err});
            }
        }).then((Users) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(Users);
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err}) || "Error occured while trying to fetch all Users";
    }
}

// Get a User by User id
userController.getAUser = async function(req, res) {
    //#swagger.tags=['User routes']
    let userId;
    try {
        userId = new ObjectId(req.params.id);
        console.log(`userId: ${userId}`);  // for testing purpose
    } catch(err) {
        return res.status(500).send({ error: "error occured while getting object id", posibleReason: "invalid objectId" })
    }
    console.log(`userId: ${userId}`); // for debugging purpose
    try {
        const dataResult = await mongodb.getDb().db(dbName).collection(userCollectionName).find({_id: userId});
        dataResult.toArray((err)=> {
            if (err) {
                logError(err);
                return res.status(400).json({message: err});
            }
        }).then((Users) => {
            // check if array is empty
            console.log(`Users: ${Users}`);  // for debugging purpose
            if (Users == null || Users == [] || Users == '') {
                return res.status(404).json({message: `User with id: ${userId}; Not found, or is empty`});
            }
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(Users);
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err}) || `Error occured while trying to fetch User with id: ${userId}`;
    }
}

// Create a User
userController.addNewUser = async function(req, res) {
    //#swagger.tags=['User routes']

    // hash passward
    const userObject = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        profilePhotoUrl: null,
        bio: req.body.bio,
        username: req.body.username,
        password: req.body.password,
        oAuthProvider: null,
        providerUserId : null,
        accountType: 'user',
        createdAt : Date.now()
    };

    try {
        const passowrdHash = bcrypt.hashSync(req.body.password);
        userObject.password = passowrdHash;
    } catch (err) {
        logError(err);
        return res.status(500).send({message: err});
    }

    try {
        const response = await mongodb.getDb().db(dbName).collection(userCollectionName).insertOne(userObject);
        console.log(response);  // for visualizing and testing purpose
        if (response.acknowledged) {
            const msg = "new user added successfully";
            console.log(msg);  // testing purpose
            res.status(200).send({ message: msg });
        } else {
            const msg = "fail to add new user";
            console.log(msg);  // for testing purpose
            res.status(500).send({ message: msg });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err} || "Error occured while inserting new user");
    }
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
    // get logged in user Id (for updating only logged in user account)
    const userId = req.session.user._id;

    let userObject = {
        _id: userId,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        profilePhotoUrl: req.body.profilePhotoUrl,
        bio: req.body.bio,
        username: req.body.username == 'any' || req.body.username == 'null' ? null : req.body.username,
        password: req.body.password == 'any' || req.body.password == 'null' ? null : bcrypt.hashSync(req.body.password),
        oAuthProvider: req.session.user.oAuthProvider,
        providerUserId : req.session.user.providerUserId,
        accountType: req.session.user.accountType,
        createdAt : req.session.user.createdAt,
        updated: []
    };

    try {
        // get the previouse user timestamp and add to updateTimestamp list, to be used for the update
        const dataResult = await mongodb.getDb().db(dbName).collection(userCollectionName).find({ _id: userId });
        dataResult.toArray((err)=> {
            if (err) {
                logError(err);
                return res.status(400).json({message: err});
            }
        }).then(async (userData) => {
            // check if array is empty
            console.log(`Users: ${userData}`);  // for debugging purpose
            if (userData == null || userData == [] || userData == '') {
                return res.status(404).json({message: `User with id: ${userId}; Not found, or is empty`});  // for debugging purpose
            }
            // add timestamps to update
            userObject.updated = userData[0].updated != undefined ? [...userData[0].updated, Date.now()] : [Date.now()];
            console.log(`updateUserObject: ${JSON.stringify(userObject)}`);  // for debugging purpose

            // check and update values with their current values if they fall in the following conditions
            const userFirstName = userObject.firstname.trim().toLowerCase();
            const userLastName = userObject.lastname.trim().toLowerCase();
            const userEmail = userObject.email.trim().toLowerCase();
            const userUsername = userObject.username.trim().toLowerCase();
            const userPassword = userObject.password.trim().toLowerCase();
            const userBio = userObject.bio.trim().toLowerCase();
            const userProfilePic = userObject.profilePhotoUrl.trim().toLowerCase();

            userFirstName == null || userFirstName == 'null' || userFirstName == 'any' || userFirstName == '' ? userObject.firstname = userData[0].firstname : userObject.firstname = userFirstName;
            userLastName == null || userLastName == 'null' || userLastName == 'any' || userLastName == '' ? userObject.lastname = userData[0].lastname : userObject.lastname = userLastName;
            userEmail == null || userEmail == 'null' || userEmail == 'any' || userEmail == '' ? userObject.email = userData[0].email : userObject.email = userEmail;
            userUsername == null || userUsername == 'null' || userUsername == 'any' || userUsername == '' ? userObject.username = userData[0].username : userObject.username = userUsername;
            userPassword == null || userPassword == 'null' || userPassword == 'any' || userPassword == '' ? userObject.password = userData[0].password : userObject.password = userPassword;
            userBio == null || userBio == 'null' || userBio == 'any' || userBio == '' ? userObject.bio = userData[0].bio : userObject.bio = userBio;
            userProfilePic == null || userProfilePic == 'null' || userProfilePic == 'any' || userProfilePic == '' ? userObject.profilePhotoUrl = userData[0].profilePhotoUrl : userObject.profilePhotoUrl = userProfilePic;
            

            // update db with UserObject
            const response = await mongodb.getDb().db(dbName).collection(userCollectionName).replaceOne({_id: userId}, userObject);
            console.log(response);  // for visualizing and testing purpose
            if (response.acknowledged && response.modifiedCount > 0) {
                const msg = `User with User-id: ${userId}; has been updated successfully`;
                console.log(msg);  // testing purpose
                res.status(200).send({message: msg});
            } else {
                const msg = `fail to update User with User-id: ${userId};\nPosible Error: Provided User id not found: ${userId}`;
                console.log(msg);  // for testing purpose
                res.status(404).send({message: msg});
            }
        })
    } catch (err) {
        console.error(err);
        res.status(500).json(err) || "Error occured while updating User";
    }
}

// Delete a User
userController.deleteAUser = async function(req, res) {
    //#swagger.tags=['User routes']
    let userId;
    try {
        userId = new ObjectId(req.params.id);
        console.log(`userId: ${userId}`);  // for testing purpose
    } catch(err) {
        return res.status(500).send({ error: "error occured while getting object id", posibleReason: "invalid objectId" })
    }
    console.log(`userId: ${userId}`); // for debugging purpose

    try {
        const response = await mongodb.getDb().db(dbName).collection(userCollectionName).deleteOne({ _id: userId });
        console.log(response);  // for visualizing and testing purpose
        if (response.acknowledged && response.deletedCount > 0) {
            const msg = `User with User-id: ${userId}; has been deleted successfully`;
            console.log(msg);  // testing purpose
            res.status(200).send({message: msg});
        } else {
            const msg = `fail to delete User with User-id: ${userId};\nPosible Error: Provided User id not found: ${userId}`;
            console.log(msg);  // for testing purpose
            res.status(404).send({message: msg});
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).json(err) || "Error occured while deleting User";
    }
}

// EXPORT CONTROLLER

module.exports = userController;