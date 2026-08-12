'use server';

import { mockDb, isSupabaseConfigured, supabase } from '@/lib/supabase/server';
import {
  calculateXpToNextLevel,
  determineHunterClass,
} from '@/lib/gamification/xp';
import {
  evaluateStreakStatus,
  verifyPenaltyQuizResult,
} from '@/lib/gamification/streak';
import {
  UserProfileResponse,
  LeaderboardResponse,
  VerifyPenaltyRequest,
  VerifyPenaltyResponse,
  LeaderboardEntry,
} from '@/types/api';
import { Hunter } from '@/types/database';

export async function getUserProfileAction(
  hunterId: string = 'usr_12345'
): Promise<UserProfileResponse> {
  try {
    let hunter: Hunter | null = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('hunters')
          .select('*')
          .eq('id', hunterId)
          .single();
        if (data) hunter = data as Hunter;
      } catch (err) {
        console.warn('Supabase profile fetch failed, using fallback mock DB:', err);
      }
    }

    if (!hunter) {
      hunter = mockDb.hunters.get(hunterId) || {
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
    }

    const streakStatus = evaluateStreakStatus(
      hunter.last_login_date,
      hunter.current_streak,
      hunter.highest_streak
    );

    return {
      success: true,
      data: {
        userId: hunter.id,
        username: hunter.username,
        hunterClass: determineHunterClass(hunter.mana_xp),
        stats: {
          totalXp: hunter.mana_xp,
          currentLevel: hunter.level,
          xpToNextLevel: calculateXpToNextLevel(hunter.mana_xp),
          currentStreak: streakStatus.currentStreak,
          highestStreak: hunter.highest_streak,
        },
        badges: hunter.unlocked_badges.map(id => ({
          badgeId: id,
          name: id,
          iconUrl: `/badges/${id}.png`,
          description: `Badge ${id}`
        })),
        needsPenaltyZone: streakStatus.needsPenaltyZone,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to fetch user profile',
    };
  }
}

export async function getLeaderboardAction(
  timeframe: string = 'weekly',
  limit: number = 10,
  currentUserId: string = 'usr_12345'
): Promise<LeaderboardResponse> {
  try {
    let huntersList: Hunter[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('hunters')
          .select('*')
          .order('mana_xp', { ascending: false })
          .limit(limit);

        if (data && data.length > 0) {
          huntersList = data as Hunter[];
        }
      } catch (err) {
        console.warn('Supabase leaderboard fetch failed, using fallback mock DB:', err);
      }
    }

    if (huntersList.length === 0) {
      huntersList = Array.from(mockDb.hunters.values()).sort(
        (a, b) => b.mana_xp - a.mana_xp
      );
    }

    const leaderboard: LeaderboardEntry[] = huntersList
      .slice(0, limit)
      .map((h, idx) => ({
        rank: idx + 1,
        username: h.username,
        level: h.level,
        totalXp: h.mana_xp,
        hunterClass: determineHunterClass(h.mana_xp, idx + 1),
        avatarUrl: `/avatars/${(idx % 5) + 1}.png`,
        isCurrentUser: h.id === currentUserId,
      }));

    return {
      success: true,
      data: {
        timeframe,
        leaderboard,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to fetch leaderboard',
    };
  }
}

export async function verifyPenaltyAction(
  req: VerifyPenaltyRequest
): Promise<VerifyPenaltyResponse> {
  try {
    const { hunterId, score, totalQuestions, timeTakenSeconds } = req;
    const result = verifyPenaltyQuizResult(score, totalQuestions, timeTakenSeconds);

    const hunter = mockDb.hunters.get(hunterId);

    if (hunter) {
      if (result.passed) {
        hunter.last_login_date = new Date().toISOString();
      } else {
        hunter.current_streak = 0;
        hunter.last_login_date = new Date().toISOString();
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        if (!result.passed) {
          await supabase
            .from('hunters')
            .update({ current_streak: 0, last_login_date: new Date().toISOString() })
            .eq('id', hunterId);
        } else {
          await supabase
            .from('hunters')
            .update({ last_login_date: new Date().toISOString() })
            .eq('id', hunterId);
        }
      } catch (err) {
        console.warn('Supabase penalty update failed:', err);
      }
    }

    return {
      success: true,
      data: {
        passed: result.passed,
        streakRestored: result.restoredStreak,
        currentStreak: hunter ? hunter.current_streak : 0,
        message: result.passed
          ? 'Penalty Zone cleared! Daily streak restored.'
          : 'Penalty Zone failed. Streak reset to 0.',
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to verify penalty zone',
    };
  }
}
