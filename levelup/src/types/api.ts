import { GateRank, HunterClass } from './database';

export interface QuizOption {
  optionId: string;
  text: string;
}

export interface QuizQuestion {
  questionId: string;
  question: string;
  options: QuizOption[];
  // Secret/Internal fields not always exposed to client prior to submission
  correctOptionId?: string;
  explanation?: string;
}

export interface GenerateLessonRequest {
  topic: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | GateRank;
  gateRank?: GateRank;
  isDailyChallenge?: boolean;
}

export interface GenerateLessonResponse {
  success: boolean;
  data?: {
    lessonId: string;
    topic: string;
    gateRank: GateRank;
    lessonContent: string;
    quiz: QuizQuestion[];
  };
  error?: string;
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string;
}

export interface SubmitQuizRequest {
  lessonId: string;
  gateId?: string;
  hunterId?: string;
  answers: UserAnswer[];
  timeTakenSeconds: number;
  performanceStats?: any[];
}

export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  correctOptionId: string;
  questionText: string;
  correctOptionText: string;
  selectedOptionText?: string;
}

export interface Badge {
  badgeId: string;
  name: string;
  iconUrl: string;
  description: string;
}

export interface SubmitQuizResponse {
  success: boolean;
  data?: {
    score: number;
    totalQuestions: number;
    results: QuestionResult[];
    gamificationUpdates: {
      xpGained: number;
      totalXp: number;
      currentLevel: number;
      levelUpTriggered: boolean;
      hunterClass: HunterClass;
      streak: {
        currentStreak: number;
        highestStreak: number;
        streakMaintained: boolean;
      };
      newBadges: Badge[];
    };
    gateUpgraded?: boolean;
    nextRank?: GateRank;
    nextRecommendedDifficulty: string;
  };
  error?: string;
}

export interface ExplainMisconceptionRequest {
  lessonId: string;
  questionId: string;
  userSelectedOptionId: string;
  gateRank?: GateRank;
}

export interface ExplainMisconceptionResponse {
  success: boolean;
  data?: {
    explanation: string;
  };
  error?: string;
}

export interface UserProfileResponse {
  success: boolean;
  data?: {
    userId: string;
    username: string;
    hunterClass: HunterClass;
    stats: {
      totalXp: number;
      currentLevel: number;
      xpToNextLevel: number;
      currentStreak: number;
      highestStreak: number;
    };
    badges: Badge[];
    needsPenaltyZone?: boolean;
  };
  error?: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  level: number;
  totalXp: number;
  hunterClass: HunterClass;
  avatarUrl: string;
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  success: boolean;
  data?: {
    timeframe: string;
    leaderboard: LeaderboardEntry[];
  };
  error?: string;
}

export interface VerifyPenaltyRequest {
  hunterId: string;
  score: number;
  totalQuestions: number;
  timeTakenSeconds: number;
}

export interface VerifyPenaltyResponse {
  success: boolean;
  data?: {
    passed: boolean;
    streakRestored: boolean;
    currentStreak: number;
    message: string;
  };
  error?: string;
}
