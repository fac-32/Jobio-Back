import { Router } from 'express';
import supabase from '../../config/supabaseClient.js';

export const usersDealbreakersRouter = Router();

// READ
/**
 * @swagger
 * /users_dealbreakers:
 *   get:
 *     summary: Get user dealbreakers (optional user filter)
 *     tags:
 *       - Users Dealbreakers
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter dealbreakers by user ID
 *     responses:
 *       200:
 *         description: List of user dealbreaker records
 *       500:
 *         description: Server error
 */
usersDealbreakersRouter.get('/', async (req, res) => {
    const { user_id } = req.query;

    let query = supabase.from('users_dealbreakers').select('*');

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
 * /users_dealbreakers:
 *   post:
 *     summary: Create a user dealbreaker record
 *     tags:
 *       - Users Dealbreakers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - dealbreakers
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user
 *               dealbreakers:
 *                 type: string
 *                 description: Dealbreakers data for the user
 *     responses:
 *       201:
 *         description: User dealbreaker created
 *       500:
 *         description: Server error
 */
usersDealbreakersRouter.post('/', async (req, res) => {
    console.log('--- Deal-breakers Saving Request Started ---');
    // 1. Extract the token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Missing authorization token' });
    }

    // 2. Verify user with Supabase
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // 3. Extract payload (Ignore user_id in body, use the one from token)
    const { user_id, dealbreakers } = req.body;

    console.log(`DealBreakers reseived: ${dealbreakers}`);

    // 4. Insert into DB
    const { data, error } = await supabase
        .from('users_dealbreakers')
        .insert([{ user_id, dealbreakers }])
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

// UPDATE
/**
 * @swagger
 * /users_dealbreakers/{id}:
 *   put:
 *     summary: Update a user dealbreaker record
 *     tags:
 *       - Users Dealbreakers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the dealbreaker record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               dealbreakers:
 *                 type: string
 *     responses:
 *       200:
 *         description: User dealbreaker updated
 *       500:
 *         description: Server error
 */
usersDealbreakersRouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id, dealbreakers } = req.body;
    const { data, error } = await supabase
        .from('users_dealbreakers')
        .update({ user_id, dealbreakers })
        .eq('id', id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// DELETE
/**
 * @swagger
 * /users_dealbreakers/{id}:
 *   delete:
 *     summary: Delete a user dealbreaker record
 *     tags:
 *       - Users Dealbreakers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the dealbreaker record
 *     responses:
 *       200:
 *         description: User dealbreaker deleted
 *       500:
 *         description: Server error
 */
usersDealbreakersRouter.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('users_dealbreakers')
        .delete()
        .eq('id', id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});
