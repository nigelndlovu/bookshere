const app = require('./app');
const mongodb = require('./models/db/connect-db');

/*************************************
****** LOCAL SERVER INFORMATION ******
*************************************/
const port = process.env.SERVER_PORT
const host = process.env.SERVER_HOST

/*************************************
******** STARTING THE SERVER *********
**************************************
*********** DATABASE SETUP ***********
**************************************/
mongodb.initDb((err) => {
    if (err) {
        console.log(err);
    } else {
        app.listen(port, ()=> {
            console.log(`Connected to DB and Server running at http://${host}:${port}`);
        })
    }
});
