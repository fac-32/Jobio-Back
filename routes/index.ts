import express from 'express';
import { authRouter } from './auth/authRoutes.js';
import { usersRouter } from './users/usersRoutes.js';
import { usersCVsRouter } from './users_cvs/usersCVsRoutes.js';
import { usersDealbreakersRouter } from './users_dealbreakers/userDealbreakersRoutes.js';
import { matchingRouter } from './matching/matchingRoutes.js';

import multer from 'multer';
import { extractCvText } from './users_cvs/users_CVsMiddleware.js';

const ROUTER = express.Router();

ROUTER.use('/auth', authRouter);
ROUTER.use('/users', usersRouter);
ROUTER.use('/users_cvs', usersCVsRouter);
ROUTER.use('/users_dealbreakers', usersDealbreakersRouter);
ROUTER.use('/matching', matchingRouter);

const upload = multer({ storage: multer.memoryStorage() }); // keep file in memory
// this endpoint is intentionally put here to avoid auth
// it will be moved to users_CVsRoutes after more integration testing
ROUTER.post('/upload-cv', upload.single('cv'), async (req, res) => {
    // Validation: Check if file exists
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Extract Dealbreakers
    // Multer populates req.body with text fields.
    // Since we JSON.stringify'd the array on frontend, we must JSON.parse it here.
    let dealbreakers: string[] = [];
    if (req.body.dealbreakers) {
        try {
            dealbreakers = JSON.parse(req.body.dealbreakers);
        } catch (e) {
            console.warn('Failed to parse dealbreakers JSON', e);
            // Fallback: treat it as empty or single string if needed
        }
    }

    // Extract Text from CV (using middleware)
    try {
        const cvText = await extractCvText(req.file);
        console.log('Extracted CV Length:', cvText.length);
        console.log('Received Dealbreakers:', dealbreakers);
        // // TO DO? Return combined data (or save to DB)
        // res.json({
        //     message: 'Bio received successfully',
        //     data: {
        //         cvText: cvText,
        //         dealbreakers: dealbreakers,
        //     },
        // });

        res.json({ cvText });
    } catch (err) {
        console.error(err);
        // Better error handling for the client
        const errorMessage =
            err instanceof Error ? err.message : 'Failed to parse CV';
        res.status(500).json({ error: errorMessage });
    }
});

export default ROUTER;
