import express from 'express';
import supabase from './config/supabaseClient.js';
import cors from 'cors';

const app = express();

app.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }),
);

app.use(express.json());

app.get('/api', (_req, res) => {
    res.send('Hello World');
});

// READ: get all users
app.get('/users', async (req, res) => {
    const { data, error } = await supabase.from('users').select('*');

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// CREATE: insert a user
app.post('/users', async (req, res) => {
    const { name, email } = req.body;

    const { data, error } = await supabase
        .from('users')
        .insert([{ name, email }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

// UPDATE: update a user by ID
app.put('/users/:id', async (req, res) => {
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

// DELETE: delete a user by ID
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Authentication

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
