import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Ensure your .env has OPENAI_API_KEY
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const extractKeywordsFromCv = async (
    cvText: string,
): Promise<string[]> => {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert HR AI. Your task is to extract a comprehensive, inclusive list of professional keywords from a CV text to assist in job matching.

                    Rules:
                    1. Extract HARD SKILLS (e.g., Python, React, AWS).
                    2. Extract SOFT SKILLS (e.g., Team Leadership, Adaptability).
                    3. Extract DOMAIN areas (e.g., Fintech, Healthcare).
                    4. **INCLUSIVITY**: Infer related titles and synonyms. (e.g., if "React" is present, include "Frontend Development" and "UI Engineering").
                    5. Output JSON only: { "keywords": ["skill1", "skill2"] }.`,
                },
                {
                    role: 'user',
                    content: `Analyze this CV and extract keywords:\n\n${cvText.substring(0, 15000)}`, // Safety truncate
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
        });

        // Use ?. to safely access properties.
        // If choices[0] doesn't exist, 'content' becomes undefined instead of crashing.
        const content = completion.choices[0]?.message?.content;

        // Guard Clause: If content is null, undefined, or empty string, stop here.
        if (!content) {
            console.warn('OpenAI returned no content.');
            return [];
        }

        // Now TypeScript knows 'content' is definitely a string
        const parsed = JSON.parse(content);
        return parsed.keywords || [];
    } catch (error) {
        console.error('OpenAI Keyword Extraction Error:', error);
        // Fail gracefully: return empty array so the upload doesn't crash
        return [];
    }
};
