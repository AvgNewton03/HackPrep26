import { GateRank, HunterClass } from '@/types/database';

export const RANK_MULTIPLIERS: Record<GateRank, number> = {
  E: 1.0,
  D: 1.2,
  C: 1.5,
  B: 2.0,
  A: 2.5,
  S: 3.0,
};

export const NEXT_RANK_MAP: Record<GateRank, GateRank> = {
  E: 'D',
  D: 'C',
  C: 'B',
  B: 'A',
  A: 'S',
  S: 'S',
};

export function calculateXpGained(
  score: number,
  totalQuestions: number,
  timeTakenSeconds: number,
  gateRank: GateRank = 'E'
): number {
  const basePointsPerQuestion = 10;
  let rawScore = score * basePointsPerQuestion;

  // Bonus for perfect score
  if (score === totalQuestions && totalQuestions > 0) {
    rawScore += 20;
  }

  // Bonus for fast completion (within 60s)
  if (timeTakenSeconds > 0 && timeTakenSeconds <= 60) {
    rawScore += 10;
  }

  const multiplier = RANK_MULTIPLIERS[gateRank] || 1.0;
  return Math.round(rawScore * multiplier);
}

export function calculateLevel(totalXp: number): number {
  const xpPerLevel = 250;
  return Math.floor(Math.max(0, totalXp) / xpPerLevel) + 1;
}

export function calculateXpToNextLevel(totalXp: number): number {
  const xpPerLevel = 250;
  const currentLevel = calculateLevel(totalXp);
  const xpRequiredForNext = currentLevel * xpPerLevel;
  return xpRequiredForNext - totalXp;
}

export function determineHunterClass(totalXp: number, rankPosition?: number): HunterClass {
  if (rankPosition !== undefined && rankPosition <= 5 && totalXp >= 30000) {
    return 'National Level Hunter';
  }
  if (totalXp >= 25000) return 'S-Rank Hunter';
  if (totalXp >= 15000) return 'A-Rank Hunter';
  if (totalXp >= 8000) return 'B-Rank Hunter';
  if (totalXp >= 4000) return 'C-Rank Hunter';
  if (totalXp >= 1500) return 'D-Rank Hunter';
  return 'E-Rank Hunter';
}

export function getNextGateRank(currentRank: GateRank): GateRank {
  return NEXT_RANK_MAP[currentRank] || currentRank;
}
