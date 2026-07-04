const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RPG Learning Engine API',
      version: '2.0.0',
      description: 'Interactive API documentation for the Gamified RPG Learning Platform.',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5055',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(options);

module.exports = swaggerDocs;
