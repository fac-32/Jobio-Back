import express, {  } from 'express';
import { authRouter } from './auth/authRoutes.js';
import { usersRouter } from './users/usersRoutes.js';
import { usersCVsRouter } from './users_cvs/usersCVsRoutes.js';
import { usersDealbreakersRouter } from './users_dealbreakers/userDealbreakersRoutes.js';
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

app.use('/users', usersRouter);
app.use('/users_cvs', usersCVsRouter);
app.use('/users_dealbreakers', usersDealbreakersRouter);

app.use('/auth', authRouter);

app.get('/api', (_req, res) => {
    res.send('Hello World');
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
