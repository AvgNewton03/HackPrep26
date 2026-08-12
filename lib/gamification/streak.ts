export interface StreakStatus {
  currentStreak: number;
  highestStreak: number;
  streakMaintained: boolean;
  needsPenaltyZone: boolean;
  daysMissed: number;
}

export function evaluateStreakStatus(
  lastLoginDateStr: string | null,
  currentStreak: number,
  highestStreak: number
): StreakStatus {
  if (!lastLoginDateStr) {
    return {
      currentStreak: 1,
      highestStreak: Math.max(1, highestStreak),
      streakMaintained: true,
      needsPenaltyZone: false,
      daysMissed: 0,
    };
  }

  const lastLogin = new Date(lastLoginDateStr);
  const now = new Date();

  // Reset time portions to compare UTC calendar days
  const lastLoginDateOnly = new Date(
    Date.UTC(lastLogin.getUTCFullYear(), lastLogin.getUTCMonth(), lastLogin.getUTCDate())
  );
  const nowDateOnly = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  const diffTime = nowDateOnly.getTime() - lastLoginDateOnly.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

  if (diffDays === 0) {
    // Logged in today
    return {
      currentStreak,
      highestStreak,
      streakMaintained: true,
      needsPenaltyZone: false,
      daysMissed: 0,
    };
  } else if (diffDays === 1) {
    // Logged in consecutive day
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      highestStreak: Math.max(newStreak, highestStreak),
      streakMaintained: true,
      needsPenaltyZone: false,
      daysMissed: 1,
    };
  } else {
    // Missed 2 or more days -> Broken streak, needs penalty zone!
    return {
      currentStreak,
      highestStreak,
      streakMaintained: false,
      needsPenaltyZone: true,
      daysMissed: diffDays,
    };
  }
}

export function verifyPenaltyQuizResult(
  score: number,
  totalQuestions: number,
  timeTakenSeconds: number
): { passed: boolean; restoredStreak: boolean } {
  // Pass condition: at least 60% score within 60 seconds
  const passingScore = Math.ceil(totalQuestions * 0.6);
  const isFastEnough = timeTakenSeconds <= 60;
  const passed = score >= passingScore && isFastEnough;

  return {
    passed,
    restoredStreak: passed,
  };
}
