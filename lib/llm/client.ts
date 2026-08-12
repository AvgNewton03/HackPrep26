import Groq from 'groq-sdk';
import { GateRank } from '@/types/database';
import { QuizQuestion } from '@/types/api';
import { buildLessonAndQuizPrompt, buildMisconceptionPrompt } from './prompts';

export interface GeneratedLessonPayload {
  lessonId: string;
  topic: string;
  gateRank: GateRank;
  lessonContent: string;
  quiz: (QuizQuestion & { correctOptionId: string; explanation: string })[];
}

// In-memory cache for generated lessons to enable fast lookups during quiz submission & misconception analysis
const lessonStore = new Map<string, GeneratedLessonPayload>();

export async function generateLLMLessonAndQuiz(
  topic: string,
  gateRank: GateRank = 'E'
): Promise<GeneratedLessonPayload> {
  const apiKey =
    process.env.GROQ_API_KEY ||
    process.env.NEXT_PUBLIC_GROQ_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const groq = new Groq({ apiKey });
      const prompt = buildLessonAndQuizPrompt(topic, gateRank);

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are the Solo Leveling System AI backend. Respond strictly with raw JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
      });

      const text = completion.choices[0]?.message?.content || '';
      const parsed = JSON.parse(text);

      const lessonId = `lsn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const payload: GeneratedLessonPayload = {
        lessonId,
        topic: parsed.topic || topic,
        gateRank: (parsed.gateRank as GateRank) || gateRank,
        lessonContent: parsed.lessonContent || `Lesson on ${topic}`,
        quiz: (parsed.quiz || []).map((q: any, idx: number) => ({
          questionId: q.questionId || `q_${idx + 1}`,
          question: q.question,
          options: q.options,
          correctOptionId: q.correctOptionId || q.options?.[0]?.optionId || 'opt_a',
          explanation: q.explanation || 'Correct answer based on the lesson text.',
        })),
      };

      lessonStore.set(lessonId, payload);
      return payload;
    } catch (err) {
      console.warn('Groq LLM API call failed or misconfigured, using fallback generator:', err);
    }
  }

  // Fallback Mock Lesson & Quiz Generator when API key is unavailable or fails
  return generateFallbackLessonAndQuiz(topic, gateRank);
}

export function getCachedLesson(lessonId: string): GeneratedLessonPayload | undefined {
  return lessonStore.get(lessonId);
}

export async function explainLLMMisconception(
  lessonId: string,
  questionId: string,
  userSelectedOptionId: string,
  gateRank: GateRank = 'E'
): Promise<string> {
  const cachedLesson = lessonStore.get(lessonId);
  const question = cachedLesson?.quiz.find((q) => q.questionId === questionId);
  const userOption = question?.options.find((o) => o.optionId === userSelectedOptionId);

  const apiKey =
    process.env.GROQ_API_KEY ||
    process.env.NEXT_PUBLIC_GROQ_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (apiKey && cachedLesson && question && userOption) {
    try {
      const groq = new Groq({ apiKey });
      const prompt = buildMisconceptionPrompt(
        cachedLesson.lessonContent,
        question.question,
        userOption.text,
        gateRank
      );

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are the Solo Leveling System AI analyzer. Respond strictly with JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
      });

      const text = completion.choices[0]?.message?.content || '';
      const parsed = JSON.parse(text);
      if (parsed.explanation) return parsed.explanation;
    } catch (err) {
      console.warn('Groq misconception analysis call failed:', err);
    }
  }

  // Fallback misconception text
  const selectedText = userOption?.text || 'your selected option';
  return `System Alert: Selecting "${selectedText}" fails to account for how ${cachedLesson?.topic || 'the topic'} operates under ${gateRank}-Rank constraints. Review the core rules before retrying.`;
}

function generateFallbackLessonAndQuiz(
  topic: string,
  gateRank: GateRank = 'E'
): GeneratedLessonPayload {
  const lessonId = `lsn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const lessonContent = `### Knowledge Download: ${topic} [${gateRank}-Rank]

Welcome Hunter. This ${gateRank}-Rank System Download provides key tactical insights into **${topic}**.

- **Core Principle**: Mastering ${topic} requires understanding foundational mechanics and state propagation.
- **Key Strategy**: Apply appropriate design patterns and handle edge cases systematically to maximize performance.
- **System Note**: Clearing this ${gateRank}-Rank Gate requires 100% accuracy on the 5 MCQs below.

Stay vigilant, Hunter.`;

  const quiz: (QuizQuestion & { correctOptionId: string; explanation: string })[] = [
    {
      questionId: 'q_101',
      question: `What is the primary objective when utilizing ${topic}?`,
      options: [
        { optionId: 'opt_a', text: 'To ensure component state side-effects execute cleanly' },
        { optionId: 'opt_b', text: 'To bypass garbage collection mechanisms' },
        { optionId: 'opt_c', text: 'To force synchronous blocking operations' },
        { optionId: 'opt_d', text: 'To disable system telemetry logging' },
      ],
      correctOptionId: 'opt_a',
      explanation: 'Ensuring state side-effects execute cleanly is essential for system stability.',
    },
    {
      questionId: 'q_102',
      question: `Which scenario represents an anti-pattern in ${topic}?`,
      options: [
        { optionId: 'opt_a', text: 'Mutating state directly outside controlled updates' },
        { optionId: 'opt_b', text: 'Using immutable data structures' },
        { optionId: 'opt_c', text: 'Decoupling side effects into custom hooks' },
        { optionId: 'opt_d', text: 'Memoizing expensive calculations' },
      ],
      correctOptionId: 'opt_a',
      explanation: 'Directly mutating state outside updates causes unpredictable re-renders and bugs.',
    },
    {
      questionId: 'q_103',
      question: `In a ${gateRank}-Rank challenge for ${topic}, what is the recommended optimization?`,
      options: [
        { optionId: 'opt_a', text: 'Minimize unneeded re-evaluations and memory allocations' },
        { optionId: 'opt_b', text: 'Increase global variable pollution' },
        { optionId: 'opt_c', text: 'Avoid error boundaries' },
        { optionId: 'opt_d', text: 'Ignore async/await error handling' },
      ],
      correctOptionId: 'opt_a',
      explanation: 'Minimizing unnecessary re-evaluations maintains optimal framerates and response speed.',
    },
    {
      questionId: 'q_104',
      question: `How should edge cases be handled when dealing with ${topic}?`,
      options: [
        { optionId: 'opt_a', text: 'Validate inputs server-side and wrap risky calls in try-catch' },
        { optionId: 'opt_b', text: 'Suppress all runtime warnings silently' },
        { optionId: 'opt_c', text: 'Hardcode dynamic parameters' },
        { optionId: 'opt_d', text: 'Never throw explicit exceptions' },
      ],
      correctOptionId: 'opt_a',
      explanation: 'Server-side validation and structured exception handling safeguard system integrity.',
    },
    {
      questionId: 'q_105',
      question: `What is the expected outcome of completing this ${topic} ${gateRank}-Rank Gate?`,
      options: [
        { optionId: 'opt_a', text: 'Earning Mana XP and upgrading the Gate rank on 100% score' },
        { optionId: 'opt_b', text: 'Losing user profile progress' },
        { optionId: 'opt_c', text: 'Permanent lockout from the Hunter Association' },
        { optionId: 'opt_d', text: 'Resetting user level to 0' },
      ],
      correctOptionId: 'opt_a',
      explanation: 'Achieving a perfect score grants Mana XP and elevates the Gate to higher difficulties.',
    },
  ];

  const payload: GeneratedLessonPayload = {
    lessonId,
    topic,
    gateRank,
    lessonContent,
    quiz,
  };

  lessonStore.set(lessonId, payload);
  return payload;
}
