import { Router } from 'express';
import supabase from '../../config/supabaseClient.js';

export const usersRouter = Router();

// READ - Get all users or filter by email
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get users (optional email filter)
 *     parameters:
 *       - in: query
 *         name: email
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of users
 */
usersRouter.get('/', async (req, res) => {
    const { email } = req.query;

    let query = supabase.from('users').select('*');

    // if provided filter by email
    if (email) {
        query = query.eq('email', email);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
});

// CREATE
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               auth_id: { type: string }
 *               name: { type: string }
 *               email: { type: string }
 *     responses:
 *       201:
 *         description: User created
 */
usersRouter.post('/', async (req, res) => {
    const { auth_id, name, email } = req.body;
    const { data, error } = await supabase
        .from('users')
        .insert([{ auth_id, name, email }])
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

// UPDATE
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               auth_id: { type: string }
 *               name: { type: string }
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: User updated
 */
usersRouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { auth_id, name, email } = req.body;
    const { data, error } = await supabase
        .from('users')
        .update({ auth_id, name, email })
        .eq('id', id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// DELETE
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User deleted
 */
usersRouter.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});
