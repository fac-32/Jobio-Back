import type { Request, Response } from 'express';
import supabase from '../config/supabaseClient.js';

export const matchJobForUser = async (req: Request, res: Response) => {
  const user = req.user; 
  const { jobDescription } = req.body;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!jobDescription) {
    return res.status(400).json({ error: 'jobDescription is required' });
  }

  try {
    const { data: cvRow, error: cvError } = await supabase
      .from('users_cvs')
      .select('cv_keywords')
      .eq('user_id', user.id)
      .single();

    if (cvError) {
      return res.status(500).json({ error: cvError.message });
    }

    const { data: dealRow, error: dealError } = await supabase
      .from('users_dealbreakers')
      .select('dealbreakers')
      .eq('user_id', user.id)
      .single();

    if (dealError) {
      return res.status(500).json({ error: dealError.message });
    }

    return res.json({
      message: 'Fetched data for matching',
      jobDescription,
      cvKeywords: cvRow?.cv_keywords ?? null,
      dealbreakers: dealRow?.dealbreakers ?? null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
