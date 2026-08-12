'use server';

import { generateLLMLessonAndQuiz } from '@/lib/llm/client';
import { GenerateLessonRequest, GenerateLessonResponse } from '@/types/api';
import { GateRank } from '@/types/database';

export async function generateLessonAction(
  req: GenerateLessonRequest
): Promise<GenerateLessonResponse> {
  try {
    const topic = req.topic?.trim();
    if (!topic) {
      return { success: false, error: 'Topic is required' };
    }

    const rank: GateRank = (req.gateRank || req.difficulty || 'E') as GateRank;

    const payload = await generateLLMLessonAndQuiz(topic, rank);

    // Sanitize quiz output to remove secret answer key when sending to client
    const clientQuiz = payload.quiz.map((q) => ({
      questionId: q.questionId,
      question: q.question,
      options: q.options,
    }));

    return {
      success: true,
      data: {
        lessonId: payload.lessonId,
        topic: payload.topic,
        gateRank: payload.gateRank,
        lessonContent: payload.lessonContent,
        quiz: clientQuiz,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to generate lesson and quiz',
    };
  }
}
