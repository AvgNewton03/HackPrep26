'use server';

import { getCachedLesson, explainLLMMisconception } from '@/lib/llm/client';
import {
  calculateXpGained,
  calculateLevel,
  determineHunterClass,
  getNextGateRank,
} from '@/lib/gamification/xp';
import { evaluateStreakStatus } from '@/lib/gamification/streak';
import { mockDb, isSupabaseConfigured, supabase } from '@/lib/supabase/server';
import { badges } from '@/lib/mockData';
import { saveRaidHistoryAction } from './history';
import {
  SubmitQuizRequest,
  SubmitQuizResponse,
  ExplainMisconceptionRequest,
  ExplainMisconceptionResponse,
  QuestionResult,
} from '@/types/api';
import { GateRank } from '@/types/database';

export async function submitQuizAction(
  req: SubmitQuizRequest
): Promise<SubmitQuizResponse> {
  try {
    const { lessonId, answers, timeTakenSeconds, hunterId = 'usr_12345', gateId } = req;
    const lesson = getCachedLesson(lessonId);

    if (!lesson) {
      return {
        success: false,
        error: 'Lesson context expired or not found. Please regenerate quiz.',
      };
    }

    let score = 0;
    const results: QuestionResult[] = [];

    // Validate answers server-side against stored secret answer keys
    lesson.quiz.forEach((q) => {
      const userAnswer = answers.find((a) => a.questionId === q.questionId);
      const isCorrect = Boolean(
        userAnswer && userAnswer.selectedOptionId === q.correctOptionId
      );

      if (isCorrect) {
        score += 1;
      }

      results.push({
        questionId: q.questionId,
        isCorrect,
        correctOptionId: q.correctOptionId || '',
        questionText: q.question,
        correctOptionText: q.options.find(o => o.optionId === q.correctOptionId)?.text || '',
        selectedOptionText: (!isCorrect && userAnswer) ? q.options.find(o => o.optionId === userAnswer.selectedOptionId)?.text : undefined,
      });
    });

    const xpGained = calculateXpGained(
      score,
      lesson.quiz.length,
      timeTakenSeconds,
      lesson.gateRank
    );

    let hunter = mockDb.hunters.get(hunterId);
    if (!hunter) {
      hunter = {
        id: hunterId,
        username: 'CodeNinja99',
        level: 1,
        mana_xp: 0,
        current_streak: 1,
        highest_streak: 1,
        hunter_class: 'E-Rank Hunter',
        last_login_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        total_answered: 0,
        unlocked_badges: [],
      };
      mockDb.hunters.set(hunterId, hunter);
    }

    hunter.total_answered = (hunter.total_answered || 0) + score;
    hunter.unlocked_badges = hunter.unlocked_badges || [];

    // Evaluate streak
    const streakStatus = evaluateStreakStatus(
      hunter.last_login_date,
      hunter.current_streak,
      hunter.highest_streak
    );

    const newTotalXp = hunter.mana_xp + xpGained;
    const newLevel = calculateLevel(newTotalXp);
    const levelUpTriggered = newLevel > hunter.level;
    const newHunterClass = determineHunterClass(newTotalXp);

    // Update hunter state
    hunter.mana_xp = newTotalXp;
    hunter.level = newLevel;
    hunter.hunter_class = newHunterClass;
    hunter.current_streak = streakStatus.currentStreak;
    hunter.highest_streak = streakStatus.highestStreak;
    hunter.last_login_date = new Date().toISOString();

    const statsForBadges = {
      xp: newTotalXp,
      dailyStreak: streakStatus.currentStreak,
      answerStreak: streakStatus.highestStreak,
      totalAnswered: hunter.total_answered,
    };

    const newlyUnlockedBadges = badges.filter(
      (b) => !hunter!.unlocked_badges.includes(b.id) && b.condition(statsForBadges)
    );

    const newBadgeIds = newlyUnlockedBadges.map((b) => b.id);
    hunter.unlocked_badges = [...hunter.unlocked_badges, ...newBadgeIds];

    // Check Adaptive Gate Upgrade (100% accuracy)
    let gateUpgraded = false;
    let nextRank: GateRank | undefined = undefined;

    if (score === lesson.quiz.length && lesson.quiz.length > 0) {
      gateUpgraded = true;
      nextRank = getNextGateRank(lesson.gateRank);

      if (gateId && mockDb.gates.has(gateId)) {
        const gate = mockDb.gates.get(gateId)!;
        gate.current_rank = nextRank;
        gate.cleared_count += 1;
      }
    }

    // Persist to Raid History (Rule of 10 applied internally)
    await saveRaidHistoryAction({
      hunter_id: hunterId,
      topic_name: lesson.topic,
      score,
      total_questions: lesson.quiz.length,
      time_taken: timeTakenSeconds,
      boss_defeated: score >= 2,
      performance_stats: req.performanceStats || [],
    });

    // Persist to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('hunters')
          .update({
            mana_xp: newTotalXp,
            level: newLevel,
            hunter_class: newHunterClass,
            current_streak: streakStatus.currentStreak,
            highest_streak: streakStatus.highestStreak,
            last_login_date: new Date().toISOString(),
          })
          .eq('id', hunterId);

        if (gateId) {
          if (gateUpgraded && nextRank) {
            await supabase
              .from('gates')
              .update({ current_rank: nextRank })
              .eq('id', gateId);
          }
        }
      } catch (err) {
        console.warn('Supabase quiz persistence failed, recorded in local state:', err);
      }
    }

    return {
      success: true,
      data: {
        score,
        totalQuestions: lesson.quiz.length,
        results,
        gamificationUpdates: {
          xpGained,
          totalXp: newTotalXp,
          currentLevel: newLevel,
          levelUpTriggered,
          hunterClass: newHunterClass,
          streak: {
            currentStreak: streakStatus.currentStreak,
            highestStreak: streakStatus.highestStreak,
            streakMaintained: streakStatus.streakMaintained,
          },
          newBadges: [
            ...newlyUnlockedBadges.map(b => ({
              badgeId: b.id,
              name: b.name,
              iconUrl: '',
              description: b.description
            })),
            ...(levelUpTriggered ? [{
              badgeId: `bdg_lvl_${newLevel}`,
              name: `Level ${newLevel} Achieved`,
              iconUrl: '/badges/level.png',
              description: `Reached Level ${newLevel} in the System!`,
            }] : [])
          ],
        },
        gateUpgraded,
        nextRank,
        nextRecommendedDifficulty: nextRank ? nextRank.toLowerCase() : 'intermediate',
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to submit quiz',
    };
  }
}

export async function explainMisconceptionAction(
  req: ExplainMisconceptionRequest
): Promise<ExplainMisconceptionResponse> {
  try {
    const { lessonId, questionId, userSelectedOptionId, gateRank = 'E' } = req;
    const explanation = await explainLLMMisconception(
      lessonId,
      questionId,
      userSelectedOptionId,
      gateRank
    );

    return {
      success: true,
      data: { explanation },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to analyze misconception',
    };
  }
}
