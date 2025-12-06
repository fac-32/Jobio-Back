import express, {  } from 'express';
import { authRouter } from './auth/authRoutes.js';
import { usersRouter } from './users/usersRoutes.js';

const app = express();
app.use(express.json());

app.use('/users', usersRouter);
app.use('/auth', authRouter);

app.get('/api', (_req, res) => {
    res.send('Hello World');
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
