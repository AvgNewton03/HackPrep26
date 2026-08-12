import { GateRank } from '@/types/database';

export const RANK_PROMPT_DESCRIPTIONS: Record<GateRank, string> = {
  E: 'Beginner / E-Rank: Focus on foundational core concepts, simple terminology, basic definitions, and introductory code snippets. Questions should test direct knowledge recall.',
  D: 'Elementary / D-Rank: Focus on practical application, basic syntax variations, common parameters, and standard use-case scenarios. Questions should test standard usage.',
  C: 'Intermediate / C-Rank: Focus on edge cases, state flow, performance considerations, and multi-component interactions. Questions should test problem-solving.',
  B: 'Advanced / B-Rank: Focus on high-level architecture, asynchronous patterns, state management traps, and internal mechanics. Questions should test deep conceptual understanding.',
  A: 'Expert / A-Rank: Focus on performance optimizations, memory management, complex system design, and security pitfalls. Questions should involve tricky scenarios.',
  S: 'Supreme / S-Rank: Focus on expert-level mastery, micro-benchmarks, framework internal source code behavior, complex bug diagnosis, and concurrency hazards. Questions must be highly challenging and precise.',
};

export function buildLessonAndQuizPrompt(topic: string, gateRank: GateRank = 'E'): string {
  const rankDescription = RANK_PROMPT_DESCRIPTIONS[gateRank] || RANK_PROMPT_DESCRIPTIONS.E;

  return `You are the Solo Leveling "System", an authoritative and sleek AI mentor preparing Hunters for Gate Dungeon Raids.
Topic: "${topic}"
Target Gate Rank: ${gateRank}-Rank.
Difficulty Guidelines: ${rankDescription}

YOUR TASK:
1. Provide a concise, highly engaging "Knowledge Download" explainer about "${topic}" tailored to ${gateRank}-Rank level (around 150-250 words). Include bullet points or code snippets where appropriate.
2. Generate EXACTLY 5 Multiple Choice Questions (MCQs) based strictly on the provided Knowledge Download text.
3. Each question must have 4 options (opt_a, opt_b, opt_c, opt_d).
4. Clearly identify the correct optionId for each question and provide a brief explanation.

Return ONLY a valid JSON object matching this exact JSON schema:
{
  "topic": "${topic}",
  "gateRank": "${gateRank}",
  "lessonContent": "Markdown formatted Knowledge Download text here...",
  "quiz": [
    {
      "questionId": "q_1",
      "question": "Question text here...",
      "options": [
        { "optionId": "opt_a", "text": "Option A text" },
        { "optionId": "opt_b", "text": "Option B text" },
        { "optionId": "opt_c", "text": "Option C text" },
        { "optionId": "opt_d", "text": "Option D text" }
      ],
      "correctOptionId": "opt_a",
      "explanation": "Brief reasoning..."
    }
  ]
}`;
}

export function buildMisconceptionPrompt(
  lessonContent: string,
  questionText: string,
  userSelectedText: string,
  gateRank: GateRank = 'E'
): string {
  return `You are the Solo Leveling "System" analyzing a Hunter's tactical mistake in a ${gateRank}-Rank Gate.

Context / Lesson Text:
${lessonContent}

Question asked to Hunter:
"${questionText}"

The Hunter incorrectly selected this option:
"${userSelectedText}"

YOUR INSTRUCTION:
Write a brief (2-4 sentences), encouraging, yet firm "System Alert" analysis explaining WHY their selected option is incorrect or based on a common misconception. 
CRITICAL RULE: DO NOT explicitly reveal which of the other options is the correct answer key directly. Instead, guide their technical reasoning so they can deduce the correct concept themselves.

Return ONLY a JSON object with this key:
{
  "explanation": "System Alert: Your selection of '${userSelectedText}' is flawed because..."
}`;
}
