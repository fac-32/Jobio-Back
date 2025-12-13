import { Router } from 'express';
import supabase from '../../config/supabaseClient.js';

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
usersCVsRouter.post('/', async (req, res) => {
    const { user_id, cv_keywords } = req.body;
    const { data, error } = await supabase
        .from('users_cvs')
        .insert([{ user_id, cv_keywords }])
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

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
