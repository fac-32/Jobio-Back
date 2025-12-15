import { Router } from 'express';
import type { Request, Response } from 'express';
import supabase from '../../config/supabaseClient.js';
import multer from 'multer';
import { extractCvText } from './users_CVsMiddleware.js';
import { extractKeywordsFromCv } from '../../services/cvExtractionService.js'; // Import the new service

const upload = multer({ storage: multer.memoryStorage() }); // keep file in memory

export const usersCVsRouter = Router();

// READ
/**
 * @swagger
 * /users_cvs:
 *   get:
 *     summary: Get user CVs (optional user filter)
 *     tags:
 *       - Users CVs
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter CVs by user ID
 *     responses:
 *       200:
 *         description: List of user CV records
 *       500:
 *         description: Server error
 */
usersCVsRouter.get('/', async (req, res) => {
    const { user_id } = req.query;

    let query = supabase.from('users_cvs').select('*');

    // if provided filter by user_id
    if (user_id) {
        query = query.eq('user_id', user_id);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// CREATE
// Handles: File Upload -> Text Extraction -> Keyword extraction (openAI)  -> DB Insert
/**
 * @swagger
 * /users_cvs:
 *   post:
 *     summary: Create a user CV record
 *     tags:
 *       - Users CVs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - cv_keywords
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user
 *               cv_keywords:
 *                 type: string
 *                 description: Comma-separated keywords extracted from the CV
 *     responses:
 *       201:
 *         description: User CV created
 *       500:
 *         description: Server error
 */
usersCVsRouter.post(
    '/',
    upload.single('cv'),
    async (req: Request, res: Response) => {
        console.log('--- CV Processing Request Started ---');

        // 1. Validation
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        console.log(`File Type: ${req.file.mimetype}, Size: ${req.file.size}`);

        // Get ID securely from the token (populated by authMiddleware)
        const user = req.user;
        // const { user_id } = req.body;
        if (!user || !user.id) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        // Note: Supabase Auth IDs are UUID STRINGS (e.g. "a0eebc99-9c0b...")
        const user_id = user.id;
        console.log(`Processing for User ID: ${user_id}`);

        let cvText = null;

        try {
            // 2. Extract Plain Text (using the middleware logic)
            cvText = await extractCvText(req.file);
            // DEBUG: Only show first 100 chars to prove it exists without flooding console
            console.log(`--- 2. Text Extracted (${cvText.length} chars) ---`);
            console.log('Preview:', cvText.substring(0, 100) + '...');

            // 3. AI Keyword Extraction
            console.log('--- 3. Calling AI Service ---');
            const keywordsArray = await extractKeywordsFromCv(cvText);

            console.log('--- 4. AI Result ---');
            console.log('Keywords:', keywordsArray);

            if (keywordsArray.length === 0) {
                console.warn('⚠️ WARNING: AI returned 0 keywords.');
            }

            // Convert array ["React", "CSS"] -> String "React, CSS" for DB storage
            // (Assuming your Supabase column is text. If it's text[], remove .join)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const cv_keywords = keywordsArray.join(', ');

            // // const { user_id, cv_keywords } = req.body;
            // // 4. Save to Supabase
            // const { data, error } = await supabase
            //     .from('users_cvs')
            //     .insert([{ user_id, cv_keywords }])
            //     .select();

            // if (error) throw error;

            // // 5. Response
            // res.status(201).json({
            //     message: 'CV processed successfully',
            //     record: data[0],
            //     // Sending the array back allows the Frontend to display tags immediately
            //     generated_tags: keywordsArray,
            // });

            // We skip sending 'record' because we didn't save it,
            // but we send 'generated_tags' so the UI still works.
            res.status(200).json({
                message: 'CV processed (DB Save Skipped)',
                generated_tags: keywordsArray,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to parse CV' });
        }
    },
);

// UPDATE
/**
 * @swagger
 * /users_cvs/{id}:
 *   put:
 *     summary: Update a user CV record
 *     tags:
 *       - Users CVs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the CV record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               cv_keywords:
 *                 type: string
 *     responses:
 *       200:
 *         description: User CV updated
 *       500:
 *         description: Server error
 */
usersCVsRouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id, cv_keywords } = req.body;
    const { data, error } = await supabase
        .from('users_cvs')
        .update({ user_id, cv_keywords })
        .eq('id', id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// DELETE
/**
 * @swagger
 * /users_cvs/{id}:
 *   delete:
 *     summary: Delete a user CV record
 *     tags:
 *       - Users CVs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the CV record
 *     responses:
 *       200:
 *         description: User CV deleted
 *       500:
 *         description: Server error
 */
usersCVsRouter.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('users_cvs')
        .delete()
        .eq('id', id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});
