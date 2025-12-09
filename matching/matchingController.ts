import type { Request, Response } from 'express';
import supabase from '../config/supabaseClient.js';
import { getMatchSuggestion } from './matchingService.js';

export const matchJobForUser = async (req: Request, res: Response) => {
    const user = req.user;
    const { jobDescription } = req.body;

    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (!jobDescription) {
        return res.status(400).json({ error: 'jobDescription is required' });
    }

    try {
        const { data: appUser, error: appUserError } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', user.id)
            .maybeSingle();

        if (appUserError) {
            return res.status(500).json({ error: appUserError.message });
        }
        if (!appUser) {
            return res
                .status(404)
                .json({ error: 'User row not found in users table' });
        }

        const appUserId = appUser.id;

        const { data: cvRow, error: cvError } = await supabase
            .from('users_cvs')
            .select('cv_keywords')
            .eq('user_id', appUserId)
            .maybeSingle();

        if (cvError) {
            return res.status(500).json({ error: cvError.message });
        }

        const { data: dealRow, error: dealError } = await supabase
            .from('users_dealbreakers')
            .select('dealbreakers')
            .eq('user_id', appUserId)
            .maybeSingle();

        if (dealError) {
            return res.status(500).json({ error: dealError.message });
        }

        // 4) DEBUG: return just DB data, no OpenAI yet
        // return res.json({
        //   message: 'Fetched data for matching (no OpenAI yet)',
        //   jobDescription,
        //   cvKeywords: cvRow?.cv_keywords ?? null,
        //   dealbreakers: dealRow?.dealbreakers ?? null,
        // });

        // later, when OpenAI is stable, replace the block above with:

        const matchResult = await getMatchSuggestion({
            jobDescription,
            cvKeywords: cvRow?.cv_keywords ?? [],
            dealbreakers: dealRow?.dealbreakers ?? [],
            // cvKeywords: cvRow?.cv_keywords ?? null,
            // dealbreakers: dealRow?.dealbreakers ?? null,
        });

        return res.json(matchResult);
    } catch (err: unknown) {
        console.error(err);

        // Narrow the error type safely
        const message =
            err instanceof Error ? err.message : 'Internal server error';

        return res.status(500).json({ error: message });
    }
};
