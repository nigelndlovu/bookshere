
// BUILD FUNCTIONS

// Display Home
async function displayHome(req, res) {
    //#swagger.tags=['Home']

    // check if user and update session value
    const homeData = {
        welcomeMsg: `Welcome to Team Thursday 1pm MT Web Services BookSphere! BookSphere API is a tool that makes managing and accessing library resources easy and efficient.`,
        apiDocs: `${process.env.SERVER_HOST}/${process.env.SERVER_PORT}/api-docs`,
        loginState: req.session.user !== undefined ? `Your are loggedIn as ${req.session.user.displayName};`: 'Logged Out',
        userRight: req.session.user != undefined ? `User Right: ${req.session.user.accountType}` : 'external-user'
    }
    res.send(homeData);
}


module.exports = { displayHome };