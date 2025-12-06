
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
  const { name, email, password } = req.body;

  // Check if user already exists users table
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    return res.status(500).json({ error: checkError.message });
  }

  if (existingUser) {
    return res.status(409).json({ error: 'User already registered' });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error || !data.user) {
    return res.status(400).json({ error: error?.message ?? 'Sign up failed' });
  }

  // Create row in users table for newly registered user
  const { error: insertError } = await supabase
    .from('users')
    .insert([
      {
        name: name,  
        email: data.user.email,
        auth_id: data.user.id, // FK to auth table
      },
    ]);

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  res.status(201).json(data);
});