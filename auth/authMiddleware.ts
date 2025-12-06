import type { NextFunction, Request, Response } from "express";
import supabase from "../config/supabaseClient.js";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  console.log('Middleware running...'); // 👈 ADD
  
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    console.log('Token:', token ? 'exists' : 'missing'); // 👈 ADD
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('Auth error:', error?.message); // 👈 ADD
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Middleware error:', error); // 👈 ADD
    res.status(500).json({ error: 'Auth middleware failed' });
  }
};
