const { body, validationResult } = require('express-validator');

const validate = {};

// VALIDATE NEW Book VALUES
validate.addNewRecordRules = () => {
    return [
        body('returnDate')
        .isDate()
        .withMessage("date must be of the format: YYYY-MM-DD")
        .custom((value, { req }) => {
            // check if date is less than now or above one week from now.
            const inputDate = new Date(value).getTime();  // convert to date object (timestamp)
            const oneWeekFromNow = Date.now() + (7 * 24 * 60 * 60 * 1000);  // in timestamp

            if (inputDate < Date.now()) {
                throw new Error('Invalid Return-Date: Date cannot be today or less than today.');
            }

            if (inputDate >= oneWeekFromNow) {
                throw new Error('Invalid Return-Date: Date cannot be more than one-week from now.');
            }

            return true;  // valid date;
        }),

        body('acknowledgePenalty')
        .custom((value, { req }) => {
            const acknowledgeValue = value.toLowerCase();
            if (acknowledgeValue != 'true' && acknowledgeValue != 'i acknowledge') {
                throw new Error('Acknowledge: You must acknowledge to take full responsiblity and penalty for the borrowed book. Enter "True" or "I Acknowledge" to procceed.');
            }
            
            return true;
        })
    ]
}

validate.updateRecordRules = () => {
    return [
        body("returnId")
        .isInt()
        .withMessage("Invalid Number Format")
    ]
}

validate.payFineRules = () => {
    return [
        body("fineId")
        .isInt()
        .withMessage("Invalid Number Format")
    ]
}

// CHECK VALIDATION
validate.checkRecord = (req, res, next) => {
    let errors = [];
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next()
}


module.exports = validate;