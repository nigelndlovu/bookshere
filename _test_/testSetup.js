const app = require('../app');
const request = require('supertest');


const setup = {};

setup.loginAdmin = async () => {
    const response = await request(app).post("/login/user").send({username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD});
    const cookie = response.headers["set-cookie"];  // Extract session cookie
    // console.log(cookie);  // for visualization purpose
    return cookie;
}


// EXPORT MODULE
module.exports = setup;