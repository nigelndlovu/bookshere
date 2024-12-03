// IMPORT MODULES
const mongodb = require('../../models/db/connect-db');

const { body, validationResult } = require('express-validator');

const validate = {};

// VALIDATE NEW User VALUES
validate.addNewUserRules = () => {
    return [];
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
    return [];
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