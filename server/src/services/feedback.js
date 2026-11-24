import { openai } from './openai.js';

const SYSTEM_PROMPT = `You are an English tutor for language learners.
The learner watched a short video clip and described it. Analyse their description.
Return ONLY valid JSON in this exact shape:
{
  "correctedText": string,
  "score": number (0-100, overall accuracy of spelling and grammar),
  "errors": [
    {
      "category": "spelling" | "grammar" | "vocabulary" | "punctuation",
      "rule": short lowercase label like "subject-verb agreement", "articles", "past tense", "prepositions",
      "original": the wrong fragment,
      "correction": the fixed fragment,
      "explanation": one short, friendly sentence
    }
  ],
  "tip": one short suggestion for improving next time
}
If the text is already correct, return an empty errors array and a high score.
Do not penalise missing capitalisation if the input came from speech transcription.`;

export async function getFeedback({ text, clipTitle, inputType }) {
  const completion = await openai.chat.completions.create({
    model: process.env.LLM_MODEL || 'gpt-4o-mini',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Clip title: ${clipTitle}\nInput type: ${inputType}\nLearner's description:\n"""${text}"""`,
      },
    ],
  });

  const parsed = JSON.parse(completion.choices[0].message.content);
  return {
    correctedText: parsed.correctedText ?? text,
    score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
    errors: Array.isArray(parsed.errors) ? parsed.errors : [],
    tip: parsed.tip ?? '',
  };
}
