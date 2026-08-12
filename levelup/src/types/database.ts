export type GateRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export type HunterClass =
  | 'Unranked'
  | 'E-Rank Hunter'
  | 'D-Rank Hunter'
  | 'C-Rank Hunter'
  | 'B-Rank Hunter'
  | 'A-Rank Hunter'
  | 'S-Rank Hunter'
  | 'National Level Hunter';

export interface Hunter {
  id: string;
  username: string;
  level: number;
  mana_xp: number;
  current_streak: number;
  highest_streak: number;
  hunter_class: HunterClass;
  last_login_date: string | null;
  created_at: string;
  total_answered: number;
  unlocked_badges: string[];
}

export interface MapNode {
  id: string;
  x_coord: number;
  y_coord: number;
  is_unlocked: boolean;
  owner_id: string | null;
  created_at: string;
}

export interface Gate {
  id: string;
  node_id: string;
  topic: string;
  current_rank: GateRank;
  cleared_count: number;
  created_at: string;
}

export interface RaidHistory {
  id: string;
  hunter_id: string;
  topic_name: string;
  score: number;
  total_questions: number;
  time_taken: number;
  boss_defeated: boolean;
  performance_stats: any[];
  created_at: string;
}
