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



/***************************************
* TESTING REVIES COLLECTION GET ROUTES *
***************************************/

describe("GET /review", ()=> {
    test("return a status code of 200", async ()=> {
        const response = await request(app).get("/review")
        expect(response.header['content-type']).toBe('application/json; charset=utf-8');
        expect(response.statusCode).toBe(200);
    });
})

describe("GET /review:id", ()=> {
    test("return a status code of 200", async ()=> {
        const response = await request(app).get("/review/675d5b55975c64e9f67b439f")
        expect(response.header['content-type']).toBe('application/json; charset=utf-8');
        expect(response.statusCode).toBe(200);
    });

    test("return a status code of 404", async ()=> {
        const response = await request(app).get("/review/675c22d04114feb3356a5caa")
        expect(response.statusCode).toBe(404);
    });

    test("return a status code of 500", async ()=> {
        const response = await request(app).get("/review/daniel").send()
        expect(response.statusCode).toBe(500);
    });
})