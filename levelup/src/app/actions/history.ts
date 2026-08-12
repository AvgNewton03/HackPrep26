'use server';

import { mockDb, isSupabaseConfigured, supabase } from '@/lib/supabase/server';
import { RaidHistory } from '@/types/database';

export async function saveRaidHistoryAction(data: Omit<RaidHistory, 'id' | 'created_at'>) {
  try {
    const newRecord: RaidHistory = {
      ...data,
      id: `rh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('raid_history').insert(newRecord);
        
        // Rule of 10 in Supabase (delete oldest beyond 10)
        const { data: allRecords } = await supabase
          .from('raid_history')
          .select('id')
          .eq('hunter_id', data.hunter_id)
          .order('created_at', { ascending: false });

        if (allRecords && allRecords.length > 10) {
          const idsToDelete = allRecords.slice(10).map((r) => r.id);
          await supabase.from('raid_history').delete().in('id', idsToDelete);
        }
      } catch (err) {
        console.warn('Supabase save raid history failed:', err);
      }
    }

    // Always update mockDb as well (for fallback/local dev)
    mockDb.raidHistory.push(newRecord);
    
    // Apply Rule of 10 to Mock DB
    const hunterHistory = mockDb.raidHistory
      .filter((h) => h.hunter_id === data.hunter_id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (hunterHistory.length > 10) {
      const toKeep = hunterHistory.slice(0, 10);
      mockDb.raidHistory = [
        ...mockDb.raidHistory.filter((h) => h.hunter_id !== data.hunter_id),
        ...toKeep,
      ];
    }

    return { success: true, data: newRecord };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getRecentHuntsAction(hunterId: string = 'usr_12345') {
  try {
    let hunts: RaidHistory[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('raid_history')
          .select('*')
          .eq('hunter_id', hunterId)
          .order('created_at', { ascending: false })
          .limit(10);
        if (data) hunts = data as RaidHistory[];
      } catch (err) {
        console.warn('Supabase fetch recent hunts failed:', err);
      }
    }

    if (hunts.length === 0) {
      // Fallback to Mock DB
      hunts = mockDb.raidHistory
        .filter((h) => h.hunter_id === hunterId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
    }

    return { success: true, data: hunts };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
