import { Router } from 'express';
import supabase from '../../config/supabaseClient.js';
import { authMiddleware } from '../auth/authMiddleware.js';

export const usersRouter = Router();

usersRouter.use(authMiddleware);

// READ
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
