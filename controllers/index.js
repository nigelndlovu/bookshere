
// BUILD FUNCTIONS

// Display Home
async function displayHome (req, res) {
    //#swagger.tags=['Home']
    const homeData = {
        welcomeMsg: `Welcome to Team Thursday 1pm MT Web Services BookShere! BookSphere API is a tool that makes managing and accessing library resources easy and efficient.
                    For Developers Building for Readers: The API provides endpoints to search for books, manage 
                    borrowing, and leave reviews. It enables features like tracking due dates, and accessing digital 
                    content like eBooks or audiobooks.
                    For Developers Building for Librarians: The API offers endpoints to manage the library catalog, 
                    track inventory, handle user accounts, and enforce borrowing policies.
                    In short, BookSphere API is designed to power applications that connect people with books while 
                    simplifying library operations through a developer-friendly interface. Enjoy!`,
        apiDocs: `${process.env.SERVER_HOST}/${process.env.SERVER_PORT}/api-docs`,
        loginState: req.session.user !== undefined ? `Your are loggedIn as ${req.session.user.displayName};`: 'Logged Out'
    }
    res.send(homeData);
}


module.exports = { displayHome };