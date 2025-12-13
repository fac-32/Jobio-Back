import { Router } from 'express';
import supabase from '../../config/supabaseClient.js';

export const usersCVsRouter = Router();

// READ
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
