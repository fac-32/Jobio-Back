import express from 'express';
import { authMiddleware } from './auth/authMiddleware.js';
import { authRouter } from './auth/authRoutes.js';
import { usersRouter } from './users/usersRoutes.js';
import { usersCVsRouter } from './users_cvs/usersCVsRoutes.js';
import { usersDealbreakersRouter } from './users_dealbreakers/userDealbreakersRoutes.js';
import { matchingRouter } from './matching/matchingRoutes.js';
import { emailVerificationRouter } from './emailVerification/emailVerficationRoute.js';


const ROUTER = express.Router();

ROUTER.use('/auth', authRouter);

ROUTER.use(authMiddleware); // Protect all routes below this line
ROUTER.use('/users', usersRouter);
ROUTER.use('/users_cvs', usersCVsRouter);
ROUTER.use('/users_dealbreakers', usersDealbreakersRouter);
ROUTER.use('/matching', matchingRouter);
ROUTER.use('/email-verify', emailVerificationRouter);

export default ROUTER;
