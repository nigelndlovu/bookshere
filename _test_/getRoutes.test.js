const request = require('supertest');
const app = require('../app');
const mongodb = require('../models/db/connect-db');


/*************************************
********* INITIALIZE DATABASE ********
**************************************/
let dbInitialized = false;
const checkDbInit = async ()=> {
    if (!dbInitialized) {
        await mongodb.initDb((err) => {
            if (err) {
                console.log(err);
            } else {
                dbInitialized = true;
            }
        });
    }
    return dbInitialized;
}

describe("Test All GET Request", ()=> {

    // BOOKS COLLECTION GET ROUTES
    describe("GET /books", ()=> {
        test("return a status code of 200", async ()=> {
            const dbResponse = await checkDbInit();
            if (dbResponse) {
                const response = await request(app).get("/books").send()
                expect(response.header['content-type']).toBe('application/json; charset=utf-8');
                expect(response.statusCode).toBe(200);
            }
        });
    })

    // describe("GET /books/:id", ()=> {
    //     test("return a status code of 200", async ()=> {
    //         const runTest = async ()=> {
    //             const response = await request(app).get("/books/67522929e727ed8ba3ba728c").send()
    //             expect(response.header['content-type']).toBe('application/json; charset=utf-8');
    //             expect(response.statusCode).toBe(200);
    //             mongodb.closeDb();  // close db connection
    //         }
    //         initDb(runTest);  // initialize db connection
    //     });

    //     test("return a status code of 404", async ()=> {
    //         const runTest = async ()=> {
    //             const response = await request(app).get("/books/67522929e727ed8ba3ba727b").send()
    //             expect(response.statusCode).toBe(404);
    //             mongodb.closeDb();  // close db connection
    //         }
    //         initDb(runTest);  // initialize db connection
    //     });

    //     test("return a status code of 500", async ()=> {
    //         const runTest = async ()=> {
    //             const response = await request(app).get("/books/daniel").send()
    //             expect(response.statusCode).toBe(500);
    //             mongodb.closeDb();  // close db connection
    //         }
    //         initDb(runTest);  // initialize db connection
    //     });
    // })

    // BORROW-RECORDS GET ROUTES
    describe("GET /borrow", ()=> {

    })

    describe("GET /borrow/:id", ()=> {

    })


    // REVIEWS ROUTES
    describe("GET /review", ()=> {

    })

    describe("GET /review:id", ()=> {

    })


    // USERS ROUTES
    describe("GET /users", ()=> {

    })

    describe("GET /users:id", ()=> {

    })

    // CLOSE DB CONNECTION
    describe("Close DB Connection", ()=> {
        test("close db connection", async ()=> {
            const dbResponse = await checkDbInit();
            if (dbResponse) {
                mongodb.closeDb();
            }
        })
    })
})