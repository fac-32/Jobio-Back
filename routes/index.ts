import express from 'express';
import { authRouter } from './auth/authRoutes.js';
import { usersRouter } from './users/usersRoutes.js';
import { usersCVsRouter } from './users_cvs/usersCVsRoutes.js';
import { usersDealbreakersRouter } from './users_dealbreakers/userDealbreakersRoutes.js';

const ROUTER = express.Router();

ROUTER.use('/auth', authRouter);
ROUTER.use('/users', usersRouter);
ROUTER.use('/users_cvs', usersCVsRouter);
ROUTER.use('/users_dealbreakers', usersDealbreakersRouter);

export default ROUTER;
