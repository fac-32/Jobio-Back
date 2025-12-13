import { openai } from '../../config/openaiClient.js';

type MatchInput = {
    jobDescription: string;
    cvKeywords: string[] | string | null;
    dealbreakers: Record<string, unknown> | null;
};

export const getMatchSuggestion = async ({
    jobDescription,
    cvKeywords,
    dealbreakers,
}: MatchInput) => {
    const prompt = `
You are a job-matching assistant.

User profile (CV keywords):
${JSON.stringify(cvKeywords, null, 2)}

User deal breakers:
${JSON.stringify(dealbreakers, null, 2)}

Job description:
${jobDescription}

You must return ONLY valid JSON (no backticks, no Markdown, no extra text).
Use exactly this structure and key names:

{
  "overall_match_score": number,
  "deal_breakers_violated": string[],
  "matched_skills": string[],
  "missing_must_have_skills": string[],
  "explanation_short": string,
  "recommendation": "Apply" | "Apply with caveats" | "Do not apply"
}
`;


    // const response = await openai.responses.create({
    //     model: 'gpt-4.1-mini',
    //     input: prompt,
    // });

    // const text = response.output_text;

    // try {
    //     return JSON.parse(text);
    // } catch {
    //     return {
    //         overall_match_score: 0,
    //         deal_breakers_violated: [],
    //         matched_skills: [],
    //         missing_must_have_skills: [],
    //         explanation_short: 'Failed to parse model output as JSON.',
    //         recommendation: 'do_not_apply',
    //         raw: text,
    //     };
    // }


    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
        { role: 'system', content: 'You are a helpful job-matching assistant.' },
        { role: 'user', content: prompt },
        ],
        temperature: 0.2,
    });

    const text = completion.choices[0]?.message?.content ?? '{}';

    try {
    return JSON.parse(text);
    } catch {
    console.error('MATCH OUTPUT PARSE FAILED. RAW TEXT:', text);
    return {
        overall_match_score: 0,
        deal_breakers_violated: [],
        matched_skills: [],
        missing_must_have_skills: [],
        explanation_short: 'Failed to parse model output as JSON.',
        recommendation: 'do_not_apply',
        raw: text,
    };
    }

};
