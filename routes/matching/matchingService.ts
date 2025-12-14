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
You are a thoughtful career advisor.

Your task is to help a user decide whether they should apply for a job,
using realism, common sense, and a supportive human tone.

You MUST return a single valid JSON object and nothing else.
Do not include markdown, backticks, headings, or text outside the JSON.

--------------------
MATCH SCORING (0–100)

- 100:
  All deal breakers are explicitly satisfied AND
  all required or essential skills in the job ad appear in the CV.

- 93–99:
  All required skills match AND
  no deal breakers are violated, but some deal breakers (e.g. salary) are not mentioned.

- 86–92:
  Some skills are not listed in the CV but can be reasonably assumed
  (e.g. HTML, CSS, JavaScript, REST APIs when React is present).

- 80–85:
  One important required skill is missing.

- 70–79:
  Two important required skills are missing.

- Below 70:
  More important skills are missing or at least one deal breaker is violated.

- Below 60:
  Multiple deal breakers are violated.

- Below 50:
  Several deal breakers are violated and many important skills are missing.

--------------------
WHAT TO ANALYZE

1. Identify which deal breakers are clearly met.
2. Identify which deal breakers are not mentioned or not met.
3. Identify skills that clearly match the job requirements.
4. Identify skills that are missing or only assumed.
5. Identify important skills that are missing.
6. Suggest things the user could work on or improve.
7. Write a short, natural explanation in human language.
8. Provide a recommendation that sounds human but remains structured.

--------------------
RECOMMENDATION STRUCTURE

The recommendation field MUST be an object with this structure:

{
  "label": "apply" | "apply_but_be_aware" | "apply_with_caution" | "apply_if_optimistic" | "do_not_apply",
  "message": string
}

Guidance:
- 93–100 → encourage applying clearly.
- 80–92 → encourage applying but mention unknowns or CV improvements.
- 65–79 → suggest applying only if comfortable with gaps.
- 50–65 → suggest applying only if feeling optimistic or flexible.
- Below 50 → recommend not applying.

--------------------
INPUT DATA

User CV keywords:
${JSON.stringify(cvKeywords, null, 2)}

User deal breakers:
${JSON.stringify(dealbreakers, null, 2)}

Job description:
${jobDescription}

--------------------
OUTPUT FORMAT

Return ONLY valid JSON in the following structure:

{
  "match_score": number,
  "matched_deal_breakers": string[],
  "unmet_or_unknown_deal_breakers": string[],
  "matched_skills": string[],
  "missing_or_assumed_skills": string[],
  "important_skills_missing": string[],
  "things_to_work_on": string[],
  "explanation": string,
  "recommendation": {
    "label": string,
    "message": string
  }
}
`;

    //     const prompt = `
    // You are a job-matching assistant.

    // User profile (CV keywords):
    // ${JSON.stringify(cvKeywords, null, 2)}

    // User deal breakers:
    // ${JSON.stringify(dealbreakers, null, 2)}

    // Job description:
    // ${jobDescription}

    // You must return ONLY valid JSON (no backticks, no Markdown, no extra text).
    // Use exactly this structure and key names:

    // {
    //   "overall_match_score": number,
    //   "deal_breakers_violated": string[],
    //   "matched_skills": string[],
    //   "missing_must_have_skills": string[],
    //   "explanation_short": string,
    //   "recommendation": "Apply" | "Apply with caveats" | "Do not apply"
    // }
    // `;

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
            {
                role: 'system',
                content: 'You are a helpful job-matching assistant.',
            },
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
