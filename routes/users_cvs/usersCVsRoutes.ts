import { Router } from 'express';
import supabase from '../../config/supabaseClient';
import { authMiddleware } from '../auth/authMiddleware';

export const usersCVsRouter = Router();

usersCVsRouter.use(authMiddleware);

// READ
usersCVsRouter.get('/', async (req, res) => {
    const { data, error } = await supabase.from('users_cvs').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// CREATE
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
