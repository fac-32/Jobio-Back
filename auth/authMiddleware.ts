import type { Request, Response, NextFunction } from 'express';
import type { User } from '@supabase/supabase-js';
import supabase from '../config/supabaseClient.js';

// Extend Express Request to include `user`
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user;
  next();
};
