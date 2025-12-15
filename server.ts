import express from 'express';
import ROUTER from './routes/index.js';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();

// CORS configuration - allow requests from frontend server
app.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }),
);

const options = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'Jobio API', version: '1.0.0' },
        servers: [{ url: 'http://localhost:3000' }],
    },
    apis: ['./routes/**/*.ts'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(express.json());

app.get('/api', (_req, res) => {
    res.send('Hello World');
});

app.use('/', ROUTER);

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
