import express from 'express';
import ROUTER from './routes/index.js';
import cors from 'cors';
import matchingRouter from './matching/matchingRoutes.js';

const app = express();

app.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }),
);

app.use(express.json());


// final version after resolving conflict
app.use('/matching', matchingRouter);


app.get('/api', (_req, res) => {
    res.send('Hello World');
});

app.use('/', ROUTER);

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
