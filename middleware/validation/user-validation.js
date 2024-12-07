// IMPORT MODULES
const mongodb = require('../../models/db/connect-db');

const { body, validationResult } = require('express-validator');

const validate = {};

// CONSTANTS
const dbName = process.env.DB_NAME;  // store database name
const userCollectionName = process.env.USER_COLLECTION;  // store name of user collection

// VALIDATE NEW User VALUES
validate.addNewUserRules = () => {
    return [
        body('firstname')
        .custom( async (value, { req }) => {
            const nameValue = value.trim();
            if (nameValue != '' && nameValue != null && nameValue != 'null' && nameValue != 'any') {
                if (nameValue.length < 2) {
                    throw new Error('firstname is too short');
                }
            }

            return true;
        }),

        body('lastname')
        .custom( async (value, { req }) => {
            const nameValue = value.trim();
            console.log(`nameValue-Lastname: ${nameValue}`);  // for debugging purpose
            if (nameValue != '' && nameValue != null && nameValue != 'null' && nameValue != 'any') {
                if (nameValue.length < 2) {
                    throw new Error('lastname is too short');
                }
            }

            return true;
        }),

        body('email')
        .custom( async (value, { req }) => {
            const emailValue = value.trim();
            if (emailValue != null) {
                if (emailValue == '') {
                    req.body.email = null;  // set email to null;  // this is not working (a value of '' will automatically be set to null)
                } else {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(emailValue)) {
                        throw new Error("invalid email format: please enter a valid email address e.g 'example@example.com'");
                    }
                }

                // check if email doesn't already exist in db
                try {
                    const usersDb = mongodb.getDb().db(dbName).collection(userCollectionName);
                    const userData = await usersDb.findOne({ email: emailValue });
                    console.log(userData);  // for visualizing and testing purpose
                    if (userData && userData.email != emailValue) {
                        // authenticate using accountType
                        throw new Error("email already exist");
                    }
                } catch (err) {
                    throw new Error(err);
                }
            }

            return true;
        }),

        body('profilePhotoUrl')
        .custom((value, { req }) => {
            const imageUrlValue = value.trim();
            if (imageUrlValue != null) {
                if (imageUrlValue == '') {
                    req.body.profilePhotoUrl = null;  // set email to null;
                } else {
                    try {
                        new URL(imageUrlValue);
                    } catch(err) {
                        throw new Error('invalid url format: please provide a valid url for your profile picture');
                    }
                }
            }
            return true;
        }),

        body('username')
        .custom( async (value, { req }) => {
            const usernameValue = value.trim();
            if (usernameValue != null) {
                if (usernameValue == '' || usernameValue == null || usernameValue == 'null' || usernameValue == 'any') {
                    req.body['username'] = null;  // set username to null;  // this is not working
                } else {
                    if (usernameValue.length < 6) {
                        throw new Error("username should not be less than 6 characters");
                    }
                }

                // check if username doesn't already exist in db
                try {
                    const usersDb = mongodb.getDb().db(dbName).collection(userCollectionName);
                    const userData = await usersDb.findOne({ username: usernameValue });
                    console.log(userData);  // for visualizing and testing purpose
                    if (userData && userData.username != usernameValue) {
                        // authenticate using accountType
                        throw new Error("username already exist");
                    }
                } catch (err) {
                    throw new Error(err);
                }
            }

            return true;
        }),

        body('password')
        .custom((value, { req }) => {
            const passwordValue = value.trim();
            if (passwordValue != null) {
                if (passwordValue == '' || passwordValue == null || passwordValue == 'null' || passwordValue == 'any') {
                    req.body.password = null;  // set email to null;  // this is not working
                } else {
                    const passwordRegex = /^[a-zA-Z0-9]{7,}$/;
                    if (!passwordRegex.test(passwordValue)) {
                        throw new Error("password must be at least 7 characters long and aplphanumeric.");
                    }
                }
            }

            return true;
        }),

        body('bio')
        .trim(),
    ];
}
// CHECK NEW User VALIDATION
validate.checkNewUser = (req, res, next) => {
    let errors = [];
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next()
}

// VALIDATE UPDATE User
validate.updateUserRules = () => {
    return [
        body('firstname')
        .custom( async (value, { req }) => {
            const nameValue = value.trim();
            if (nameValue != '' && nameValue != null && nameValue != 'null' && nameValue != 'any') {
                if (nameValue.length < 2) {
                    throw new Error('firstname is too short');
                }
            }

            return true;
        }),

        body('lastname')
        .custom( async (value, { req }) => {
            const nameValue = value.trim();
            console.log(`nameValue-Lastname: ${nameValue}`);  // for debugging purpose
            if (nameValue != '' && nameValue != null && nameValue != 'null' && nameValue != 'any') {
                if (nameValue.length < 2) {
                    throw new Error('lastname is too short');
                }
            }

            return true;
        }),

        body('email')
        .custom( async (value, { req }) => {
            const emailValue = value.trim();
            if (emailValue != null) {
                if (emailValue == '') {
                    req.body.email = null;  // set email to null;  // this is not working (a value of '' will automatically be set to null)
                } else {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(emailValue)) {
                        throw new Error("invalid email format: please enter a valid email address e.g 'example@example.com'");
                    }

                    // check if email was changed
                    if (req.session.user.email != emailValue) {
                        // check if email doesn't already exist in db
                        try {
                            const usersDb = mongodb.getDb().db(dbName).collection(userCollectionName);
                            const userData = await usersDb.findOne({ email: emailValue });
                            console.log(userData);  // for visualizing and testing purpose
                            if (userData && userData.email != emailValue) {
                                // authenticate using accountType
                                throw new Error("email already exist");
                            }
                        } catch (err) {
                            throw new Error(err);
                        }
                    }
                }
            }

            return true;
        }),

        body('profilePhotoUrl')
        .custom((value, { req }) => {
            const imageUrlValue = value.trim();
            if (imageUrlValue != null) {
                if (imageUrlValue == '') {
                    req.body.profilePhotoUrl = null;  // set email to null;
                } else {
                    try {
                        new URL(imageUrlValue);
                    } catch(err) {
                        throw new Error('invalid url format: please provide a valid url for your profile picture');
                    }
                }
            }
            return true;
        }),

        body('username')
        .custom( async (value, { req }) => {
            const usernameValue = value.trim();
            if (usernameValue != null) {
                if (usernameValue == '' || usernameValue == null || usernameValue == 'null' || usernameValue == 'any') {
                    req.body['username'] = null;  // set username to null;  // this is not working
                } else {
                    if (usernameValue.length < 6) {
                        throw new Error("username should not be less than 6 characters");
                    }

                    // check if username was changed
                    if (req.session.user.username != usernameValue) {
                        // check if username doesn't already exist in db
                        try {
                            const usersDb = mongodb.getDb().db(dbName).collection(userCollectionName);
                            const userData = await usersDb.findOne({ username: usernameValue });
                            console.log(userData);  // for visualizing and testing purpose
                            if (userData && userData.username != usernameValue) {
                                // authenticate using accountType
                                throw new Error("username already exist");
                            }
                        } catch (err) {
                            throw new Error(err);
                        }
                    }
                }
            }

            return true;
        }),

        body('password')
        .custom((value, { req }) => {
            const passwordValue = value.trim();
            if (passwordValue != null) {
                if (passwordValue == '' || passwordValue == null || passwordValue == 'null' || passwordValue == 'any') {
                    req.body.password = null;  // set email to null;  // this is not working
                } else {
                    const passwordRegex = /^[a-zA-Z0-9]{7,}$/;
                    if (!passwordRegex.test(passwordValue)) {
                        throw new Error("password must be at least 7 characters long and aplphanumeric.");
                    }
                }
            }

            return true;
        }),

        body('bio')
        .trim(),
    ];
}

validate.checkUpdateUser = (req, res, next) => {
    let errors = [];
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next()
}


module.exports = validate;