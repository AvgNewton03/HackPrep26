import { createClient } from '@supabase/supabase-js';
import { Hunter, MapNode, Gate, RaidHistory } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock database store for seamless local execution without live credentials
export const mockDb = {
  hunters: new Map<string, Hunter>([
    [
      'usr_12345',
      {
        id: 'usr_12345',
        username: 'CodeNinja99',
        level: 5,
        mana_xp: 1240,
        current_streak: 7,
        highest_streak: 14,
        hunter_class: 'E-Rank Hunter',
        last_login_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ],
    [
      'usr_sung',
      {
        id: 'usr_sung',
        username: 'SungJinWoo',
        level: 50,
        mana_xp: 45000,
        current_streak: 30,
        highest_streak: 45,
        hunter_class: 'National Level Hunter',
        last_login_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ],
  ]),
  mapNodes: new Map<string, MapNode>([
    [
      'node_1',
      {
        id: 'node_1',
        x_coord: 50.0,
        y_coord: 50.0,
        is_unlocked: true,
        owner_id: 'usr_12345',
        created_at: new Date().toISOString(),
      },
    ],
    [
      'node_2',
      {
        id: 'node_2',
        x_coord: 30.0,
        y_coord: 40.0,
        is_unlocked: true,
        owner_id: 'usr_12345',
        created_at: new Date().toISOString(),
      },
    ],
    [
      'node_3',
      {
        id: 'node_3',
        x_coord: 70.0,
        y_coord: 60.0,
        is_unlocked: false,
        owner_id: 'usr_12345',
        created_at: new Date().toISOString(),
      },
    ],
  ]),
  gates: new Map<string, Gate>([
    [
      'gate_1',
      {
        id: 'gate_1',
        node_id: 'node_1',
        topic: 'React Hooks',
        current_rank: 'E',
        cleared_count: 2,
        created_at: new Date().toISOString(),
      },
    ],
  ]),
  raidHistory: [] as RaidHistory[],
};
