import { Router } from 'express';
import { matchJobForUser } from './matchingController.js';

export const matchingRouter = Router();

matchingRouter.get('/test', (req, res) => {
    res.send('Matching router works!');
});

/**
 * @swagger
 * /matching:
 *   post:
 *     summary: Get a job match suggestion for the authenticated user
 *     description: >
 *       Uses the authenticated user's CV keywords and dealbreakers to
 *       generate a match suggestion for a given job description.
 *     tags:
 *       - Matching
 *     security:
 *       - bearerAuth: []   # assumes you defined a Bearer JWT scheme in components.securitySchemes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobDescription
 *             properties:
 *               jobDescription:
 *                 type: string
 *                 description: Full job description text to match against
 *     responses:
 *       200:
 *         description: Match suggestion result
 *       400:
 *         description: jobDescription missing
 *       401:
 *         description: Unauthorized (no user on request)
 *       404:
 *         description: User row not found in users table
 *       500:
 *         description: Server error while fetching data or generating match
 */
matchingRouter.post('/', matchJobForUser);
