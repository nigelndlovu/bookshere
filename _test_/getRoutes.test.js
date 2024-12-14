const supertest = require('supertest');
const app = require('../app');

describe("Test All GET Request", ()=> {

    // BOOKS COLLECTION GET ROUTES
    describe("GET /books", ()=> {
        test("return a status code of 200", async ()=> {
            const response = await supertest.request(app).get("/books").send()
            expect(response.statusCode).toBe(200);
        })


    })

    describe("GET /books/:id", ()=> {

    })

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

})