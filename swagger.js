const swaggerAutogen = require ('swagger-autogen')();

const doc = {
    info: {
        title: 'BookSphere Api',
        description: 'BookSphere Api'
    },
    host: 'localhost:5000',
    schemes: ['https']
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

//This will generate a swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);