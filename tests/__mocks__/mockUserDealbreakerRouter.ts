import express from 'express';
import cors from 'cors';
import { usersDealbreakersRouter } from '../../routes/users_dealbreakers/userDealbreakersRoutes';

const testApp = express();

testApp.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }),
);

const ROUTER = express.Router();
ROUTER.use('/users_dealbreakers', usersDealbreakersRouter);

testApp.use(express.json());

testApp.use('/', ROUTER);

export default testApp;
