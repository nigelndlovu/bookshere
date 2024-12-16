/**************************************
********** REQUIRE STATEMENTS *********
**************************************/ 
// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser")
const dotenv = require('dotenv');
const cors = require('cors');
// const { logError, returnError, isOperationalError } = require('./errorHandler');

// Modules
// const mongodb = require('./models/db/connect-db');  
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;
const routes = require('./routes');
const authenticate = require('./middleware/authenticate');
const userController = require('./controllers/user');



/**************************************
*********** EXPRESS SETUP *************
**************************************/
const app = express();
dotenv.config();  // using dotenv.config to load environment variables


/* *************************************
*************** MIDDLEWARE *************
***************************************/
// Middleware for parsing JSON requests
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for session
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
}));
// Middleware for passport (required for Oauth Authorization)
app.use(passport.initialize());
// allow express-session to be used by passport
app.use(passport.session());

// Middleware for handling CORS requests
app.use(cors());

// CookieParser MiddleWare
app.use(cookieParser())

// check for jwt token and verify token if exist
app.use(authenticate.checkJWTToken);


// using github to authenticate user
passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL
    },
    async function(accessToken, refreshToken, profile, done) {
        // send object to request
        const response = await userController.findOrCreateOAuthProviderProfile({ oAuthProvider: profile.provider, profileId: profile.id }, profile);  // check if the profile of the requested provider exist and create if it does not exist.
        console.log(`findOrCreateOAuthProfileResponse: ${JSON.stringify(response)}`);  // for testing purpose
        if (response.status == 200 || response.status == 201) {
            console.log(`Current User Profile Object: ${JSON.stringify(profile)}`);
            return done(null, response.userData); 
        } else {
            return done(response.message);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

/*************************************
*********** ROUTES SETUPS ************
*************************************/
// Get Routes
app.use('/', routes)


/*************************************
******** SWAGGER HEADERS *************
**************************************
**************************************
**************************************/
// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested-With, Content-Type, Accept,Z-Key, Authorization"
//     );
//     res.setHeader(
//         "Access-Control-Allow-Methods",
//         "POST, GET, PUT, DELETE, OPTIONS"
//     );
//     next();
// });

module.exports = app;