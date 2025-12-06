import { Router } from 'express';
import supabase from '../config/supabaseClient.js';
import { authMiddleware } from '../auth/authMiddleware.js';

export const usersRouter = Router();

// Protect all /users routes
usersRouter.use(authMiddleware);

// READ
usersRouter.get('/', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// CREATE
usersRouter.post('/', async (req, res) => {
  const { name, email } = req.body;
  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// UPDATE
usersRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const { data, error } = await supabase
    .from('users')
    .update({ name, email })
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