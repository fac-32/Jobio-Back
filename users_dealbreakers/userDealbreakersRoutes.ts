import { Router } from 'express';
import supabase from '../config/supabaseClient.js';
import { authMiddleware } from '../auth/authMiddleware.js';

export const usersDealbreakersRouter = Router();

usersDealbreakersRouter.use(authMiddleware);

// READ
usersDealbreakersRouter.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('users_dealbreakers')
        .select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// CREATE
usersDealbreakersRouter.post('/', async (req, res) => {
    const { user_id, dealbreakers } = req.body;
    const { data, error } = await supabase
        .from('users_dealbreakers')
        .insert([{ user_id, dealbreakers }])
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

// UPDATE
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
