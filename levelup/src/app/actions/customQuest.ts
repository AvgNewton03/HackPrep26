'use server';

import {
  calculateXpGained,
  calculateLevel,
  determineHunterClass,
} from '@/lib/gamification/xp';
import { evaluateStreakStatus } from '@/lib/gamification/streak';
import { mockDb, isSupabaseConfigured, supabase } from '@/lib/supabase/server';
import { badges } from '@/lib/mockData';
import { saveRaidHistoryAction } from './history';

export async function submitCustomQuestAction({
  hunterId = 'usr_12345',
  score,
  totalQuestions,
  timeTakenSeconds,
  topicName,
  performanceStats = [],
}: {
  hunterId?: string;
  score: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  topicName: string;
  performanceStats?: any[];
}) {
  try {
    const xpGained = calculateXpGained(
      score,
      totalQuestions,
      timeTakenSeconds,
      'E' // Default to E rank for custom quests
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

    const streakStatus = evaluateStreakStatus(
      hunter.last_login_date,
      hunter.current_streak,
      hunter.highest_streak
    );

    const newTotalXp = hunter.mana_xp + xpGained;
    const newLevel = calculateLevel(newTotalXp);
    const levelUpTriggered = newLevel > hunter.level;
    const newHunterClass = determineHunterClass(newTotalXp);

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
      } catch (err) {
        console.warn('Supabase profile update failed for custom quest:', err);
      }
    }

    // Persist to Raid History
    await saveRaidHistoryAction({
      hunter_id: hunterId,
      topic_name: topicName,
      score,
      total_questions: totalQuestions,
      time_taken: timeTakenSeconds,
      boss_defeated: score >= 2, // arbitrary threshold for custom quest
      performance_stats: performanceStats,
    });

    return {
      success: true,
      data: {
        score,
        totalQuestions,
        gamificationUpdates: {
          xpGained,
          totalXp: newTotalXp,
          currentLevel: newLevel,
          hunterClass: newHunterClass,
          levelUpTriggered,
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
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to submit custom quest score.',
    };
  }
}
