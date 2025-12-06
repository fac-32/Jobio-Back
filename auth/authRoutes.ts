
import { Router } from 'express';
import supabase from '../config/supabaseClient.js';

export const authRouter = Router();

// Authentication - login
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({
    user: data.user,
    session: data.session,
  });
});

// Authentication - register
authRouter.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json(data);
});