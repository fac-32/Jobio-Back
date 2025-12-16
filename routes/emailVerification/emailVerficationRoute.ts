import { Router } from 'express';
import { verifyEmail } from '../../utils/verifyEmail.js';

export const emailVerificationRouter = Router();

// Email verification
emailVerificationRouter.post('/verify', async (req, res) => {
    try {
        const { email } = req.body;
        const result = await verifyEmail(email);

        if (!result.valid) {
            return res.status(400).json({
                valid: false,
                reason: result.reason,
                details: result.details,
            });
        }

        return res.status(200).json({
            valid: true,
            details: result.details,
        });
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Email verification error:', err.message);
        return res
            .status(500)
            .json({ error: 'Email verification service unavailable' });
    }
});
