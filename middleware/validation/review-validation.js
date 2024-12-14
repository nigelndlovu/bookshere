const { body, validationResult } = require('express-validator');

const validate = {};

// VALIDATE NEW Book VALUES
validate.addReviewRules = () => {
    return [
        body('rating')
        .isInt()
        .withMessage("rating must be an integer. i.e. a whole number")
        .custom((value, { req }) => {
            // check to make sure rating is not less than 0 and not more than 10;
            if (value < 0 || value > 10) {
                throw new Error ("Invalid Rating: Rating must be between 0 and 10");
            }
            return true;  // valid;
        }),

        body('comment')
        .isString()
        .withMessage("comment must be a valid string")
        .custom((value, { req }) => {
            const comment = value.trim();
            const maxCharacter = 3;
            if (comment != "" && comment.length < maxCharacter) {
                throw new Error(`Comment too short. Comment must be more than ${maxCharacter}`);
            }
            
            return true;
        })
    ]
}

validate.updateReviewRules = () => {
    return [
        body('rating')
        .isInt()
        .withMessage("rating must be an integer. i.e. a whole number")
        .custom((value, { req }) => {
            // check to make sure rating is not less than 0 and not more than 10;
            if (value < 0 || value > 10) {
                throw new Error ("Invalid Rating: Rating must be between 0 and 10");
            }
            return true;  // valid;
        }),

        body('comment')
        .isString()
        .withMessage("comment must be a valid string")
        .custom((value, { req }) => {
            const comment = value.trim();
            const maxCharacter = 3;
            if (comment != "" && comment.length < maxCharacter) {
                throw new Error(`Comment too short. Comment must be more than ${maxCharacter}`);
            }
            
            return true;
        })
    ]
}

// CHECK VALIDATION
validate.checkReview = (req, res, next) => {
    let errors = [];
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next()
}


module.exports = validate;