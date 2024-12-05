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
    // Checks
    const bookGenres = ["fantasy", "science fiction", "mystery", "thriller", "romance", "horror", "historical fiction", "contemporary fiction", "literary fiction", "young adult", "dystopian", "biography", "autobiography", "self-help", "history", "science", "travel", "true crime", "philosophy", "politics", "business"];
    return [
        body('title')
        .trim()
        .escape()
        .isString()
        .notEmpty()
        .isLength({min: 3})
        .withMessage("title should not be empty"),

        body('author')
        .trim()
        .escape()
        .isString()
        .notEmpty()
        .isLength({min: 3})
        .withMessage("author name should not be empty"),

        body('genre')
        .trim()
        .isIn(bookGenres)
        .withMessage(`genre must be of one of: ${bookGenres.join(', ')};`),

        body('publishedDate')
        .isDate()
        .withMessage("date must be of the format: YYYY-MM-DD"),

        body('summary')
        .trim()
        .escape()
        .isString()
        .notEmpty()
        .isLength({min: 6})
        .withMessage("book summary should not be empty, and should be more than six (6) characters"),

        body('totalCopies')
        .trim()
        .isInt()
        .withMessage("totalCopies is required!"),

        body('availableCopies')
        .trim()
        .isInt()
        .withMessage("Available copies is required")
        .custom((value, { req }) => {
            // A Custom Check to ensure availableCopies is not more than totalCopies

            const { totalCopies } = req.body;  // get the request 'totalCopies' field value from the body
            // appling extral check to make sure totalCopies is passed, becaused it's required for the validation
            if (totalCopies < value) {
                throw new Error('availableCopies can not be more than totalCopies.');
            }

            // Validate Based On 'totalCopies'
            return true;
        }),
    ]
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