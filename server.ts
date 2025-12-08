import express from 'express';
import ROUTER from './routes/index.js';
import cors from 'cors';

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

app.get('/api', (_req, res) => {
    res.send('Hello World');
});

app.use('/', ROUTER);

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
