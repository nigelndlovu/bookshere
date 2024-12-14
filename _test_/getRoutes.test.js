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
                // mongodb.closeDb();  // close db connection
            }
        });
    }
    return dbInitialized;
}

describe("Test All GET Request", ()=> {

    // BOOKS COLLECTION GET ROUTES
    describe("GET /books", ()=> {
        test("return a status code of 200", async ()=> { // running simultaneous with other test
            const db = await checkDbInit(); // check is being performed at once with other checks
            if (db) {
                // console.log(`DB_RESPONSE: ${db}`);
                const response = await request(app).get("/books").send()
                expect(response.header['content-type']).toBe('application/json; charset=utf-8');
                expect(response.statusCode).toBe(200);
            }
            console.log(`DB_RESPONSE: ${db}`);
        });
    })

    describe("GET /books/:id", ()=> {
        test("return a status code of 200", async ()=> {
            const db = await checkDbInit();
            if (db) {
                const response = await request(app).get("/books/67522929e727ed8ba3ba728c").send()
                expect(response.header['content-type']).toBe('application/json; charset=utf-8');
                expect(response.statusCode).toBe(200);
            }
        });

        test("return a status code of 404", async ()=> {
            const db = await checkDbInit();
            if (db) {
                const response = await request(app).get("/books/67522929e727ed8ba3ba727b").send()
                expect(response.statusCode).toBe(404);
            }
        });

        test("return a status code of 500", async ()=> {
            const db = await checkDbInit();
            if (db) {
                const response = await request(app).get("/books/daniel").send()
                expect(response.statusCode).toBe(500);
            }
        });
    })

    // BORROW-RECORDS GET ROUTES
    
    describe("GET /borrow", ()=> {
        test("return a status code of 200", async ()=> { // running simultaneous with other test
            const db = await checkDbInit(); // check is being performed at once with other checks
            if (db) {
                const response = await request(app).get("/borrow").send()
                expect(response.header['content-type']).toBe('application/json; charset=utf-8');
                expect(response.statusCode).toBe(200);
            }
        });
    })

    describe("GET /borrow/:id", ()=> {
        test("return a status code of 200", async ()=> {
            const db = await checkDbInit();
            if (db) {
                const response = await request(app).get("/borrow/675c22d04114feb3356a5d11").send()
                expect(response.header['content-type']).toBe('application/json; charset=utf-8');
                expect(response.statusCode).toBe(200);
            }
        });

        test("return a status code of 404", async ()=> {
            const db = await checkDbInit();
            if (db) {
                const response = await request(app).get("/borrow/675c22d04114feb3356a5caa").send()
                expect(response.statusCode).toBe(404);
            }
        });

        test("return a status code of 500", async ()=> {
            const db = await checkDbInit();
            if (db) {
                const response = await request(app).get("/borrow/daniel").send()
                expect(response.statusCode).toBe(500);
            }
        });
    })


    // REVIEWS ROUTES
    describe("GET /review", ()=> {
        test("return a status code of 200", async ()=> { // running simultaneous with other test
            const db = await checkDbInit(); // check is being performed at once with other checks
            if (db) {
                const response = await request(app).get("/review").send()
                expect(response.header['content-type']).toBe('application/json; charset=utf-8');
                expect(response.statusCode).toBe(200);
            }
        });
    })

    describe("GET /review:id", ()=> {
        test("return a status code of 200", async ()=> {
            const db = await checkDbInit();
            if (db) {
                const response = await request(app).get("/review/675d5b55975c64e9f67b439f").send()
                expect(response.header['content-type']).toBe('application/json; charset=utf-8');
                expect(response.statusCode).toBe(200);
            }
        });

        test("return a status code of 404", async ()=> {
            const db = await checkDbInit();
            if (db) {
                const response = await request(app).get("/review/675c22d04114feb3356a5caa").send()
                expect(response.statusCode).toBe(404);
            }
        });

        test("return a status code of 500", async ()=> {
            const db = await checkDbInit();
            if (db) {
                const response = await request(app).get("/review/daniel").send()
                expect(response.statusCode).toBe(500);
            }
        });
    })


    // USERS ROUTES
    describe("GET /users", ()=> {
        test("return a status code of 200", async ()=> { // running simultaneous with other test
            const db = await checkDbInit(); // check is being performed at once with other checks
            if (db) {
                const response = await request(app).get("/users").send()
                expect(response.header['content-type']).toBe('application/json; charset=utf-8');
                expect(response.statusCode).toBe(200);
            }
        });
    })

    describe("GET /users:id", ()=> {
        test("return a status code of 200", async ()=> {
            const db = await checkDbInit();
            if (db) {
                const response = await request(app).get("/users/675bd09c3f6f5720425b90ef").send()
                expect(response.header['content-type']).toBe('application/json; charset=utf-8');
                expect(response.statusCode).toBe(200);
            }
        });

        test("return a status code of 404", async ()=> {
            const db = await checkDbInit();
            if (db) {
                const response = await request(app).get("/users/675c22d04114feb3356a5caa").send()
                expect(response.statusCode).toBe(404);
            }
        });

        test("return a status code of 500", async ()=> {
            const db = await checkDbInit();
            if (db) {
                const response = await request(app).get("/users/daniel").send()
                expect(response.statusCode).toBe(500);
            }
        });
    })

    // // CLOSE DB CONNECTION
    // if (dbInitialized) {
    //     mongodb.closeDb();
    // }
})