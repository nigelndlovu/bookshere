const request = require('supertest');
const app = require('../app');
const mongodb = require('../models/db/connect-db');
const testSetup = require('./testSetup');


let cookie;  // store login session
beforeAll(async () => {
    /*************************************
    ************ INITIALIZE DB ***********
    **************************************/
    await mongodb.initTestDb();
    // LOGIN ADMIN ADMIN (FULL ACCOUNT CONTROL)
    cookie = await testSetup.loginAdmin();
});

// afterEach(async () => {
//    
// });

afterAll(async () => {
    await mongodb.closeDb();
    await request(app).get("/logout");
});


/**************************************
* TESTING BOOKS COLLECTION GET ROUTES *
**************************************/
describe("GET /books", ()=> {
    test("return a status code of 200", async ()=> { 
        const response = await request(app).get("/books").send()
        expect(response.header['content-type']).toBe('application/json; charset=utf-8');
        expect(response.statusCode).toBe(200);
    });
})

describe("GET /books/:id", ()=> {
    test("return a status code of 200", async ()=> {
        const response = await request(app).get("/books/67522929e727ed8ba3ba728c").send()
        expect(response.header['content-type']).toBe('application/json; charset=utf-8');
        expect(response.statusCode).toBe(200);
    });

    test("return a status code of 404", async ()=> {
        const response = await request(app).get("/books/67522929e727ed8ba3ba727b").send()
        expect(response.statusCode).toBe(404);
    });

    test("return a status code of 500", async ()=> {
        const response = await request(app).get("/books/daniel").send()
        expect(response.statusCode).toBe(500);
    });
})