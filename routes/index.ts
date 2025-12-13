import express from 'express';
import { authMiddleware } from './auth/authMiddleware.js';
import { authRouter } from './auth/authRoutes.js';
import { usersRouter } from './users/usersRoutes.js';
import { usersCVsRouter } from './users_cvs/usersCVsRoutes.js';
import { usersDealbreakersRouter } from './users_dealbreakers/userDealbreakersRoutes.js';
import { matchingRouter } from './matching/matchingRoutes.js';

import multer from 'multer';
import { extractCvText } from './users_cvs/users_CVsMiddleware.js';

const ROUTER = express.Router();

ROUTER.use('/auth', authRouter);

ROUTER.use(authMiddleware); // Protect all routes below this line
ROUTER.use('/users', usersRouter);
ROUTER.use('/users_cvs', usersCVsRouter);
ROUTER.use('/users_dealbreakers', usersDealbreakersRouter);
ROUTER.use('/matching', matchingRouter);

const upload = multer({ storage: multer.memoryStorage() }); // keep file in memory
// this endpoint is intentionally put here to avoid auth
// it will be moved to users_CVsRoutes after more integration testing
ROUTER.post('/upload-cv', upload.single('cv'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const text = await extractCvText(req.file);
        res.json({ text });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to parse CV' });
    }
});

export default ROUTER;
