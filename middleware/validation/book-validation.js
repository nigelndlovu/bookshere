const { body, validationResult } = require('express-validator');

const validate = {};

// VALIDATE NEW Book VALUES
validate.addNewBookRules = () => {
    return [];
}

// CHECK NEW Book VALIDATION
validate.checkNewBook = (req, res, next) => {
    let errors = [];
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next()
}

// VALIDATE UPDATE Book
validate.updateBookRules = () => {
    return [];
}

validate.checkUpdateBook = (req, res, next) => {
    let errors = [];
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next()
}


module.exports = validate;