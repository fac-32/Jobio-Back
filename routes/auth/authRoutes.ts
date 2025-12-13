import { Router } from 'express';
import supabase from '../../config/supabaseClient.js';

export const authRouter = Router();

// Authentication - login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user with email and password and returns a session containing a JWT.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid credentials or authentication error
 */
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return res.status(400).json({ error: error.message });

    res.json({
        user: data.user,
        session: data.session, // contains JWT
    });
});

// Authentication - logout
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out a user
 *     description: Invalidates the current JWT access token.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: No token provided
 *       400:
 *         description: Logout error
 */
authRouter.post('/logout', async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const { error } = await supabase.auth.admin.signOut(token);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Logged out successfully' });
});

// Authentication - register
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new Supabase auth user and a corresponding row in the users table.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Sign up failed
 *       409:
 *         description: User already registered
 *       500:
 *         description: Server error while checking or inserting user
 */
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
        options: {
            emailRedirectTo: 'http://localhost:5173/confirm-email',
        },
    });

    if (error || !data.user) {
        return res
            .status(400)
            .json({ error: error?.message ?? 'Sign up failed' });
    }

    // Create row in users table for newly registered user
    const { error: insertError } = await supabase.from('users').insert([
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
