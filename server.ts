import express, { Router } from 'express';
import supabase from './config/supabaseClient.js';
//import { authMiddleware } from './auth/authMiddleware.js';

const app = express();
app.use(express.json());

const usersRouter = Router();
//usersRouter.use(authMiddleware);

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

app.use('/users', usersRouter);

app.get('/api', (_req, res) => {
    res.send('Hello World');
});

// Authentication - login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const { data, error } = await supabase.auth
    .signInWithPassword({ email, password });
  
  if (error) return res.status(400).json({ error: error.message });
  res.json({ 
    user: data.user, 
    session: data.session 
  });
});

// Authentication - register
app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;
  
  const { data, error } = await supabase.auth
    .signUp({ email, password });
  
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
