'use server';

import { mockDb, isSupabaseConfigured, supabase } from '@/lib/supabase/server';
import { MapNode, Gate } from '@/types/database';

export async function getMapNodesAction() {
  try {
    let nodes: MapNode[] = [];
    let gates: Gate[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: nodeData } = await supabase.from('map_nodes').select('*');
        const { data: gateData } = await supabase.from('gates').select('*');
        if (nodeData) nodes = nodeData as MapNode[];
        if (gateData) gates = gateData as Gate[];
      } catch (err) {
        console.warn('Supabase map fetch failed, using fallback mock DB:', err);
      }
    }

    if (nodes.length === 0) {
      nodes = Array.from(mockDb.mapNodes.values());
      gates = Array.from(mockDb.gates.values());
    }

    return {
      success: true,
      data: {
        nodes,
        gates,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to fetch map nodes',
    };
  }
}

export async function unlockNodeAction(nodeId: string, topic?: string) {
  try {
    const node = mockDb.mapNodes.get(nodeId);
    if (node) {
      node.is_unlocked = true;
    }

    if (topic && node) {
      const gateId = `gate_${Date.now()}`;
      mockDb.gates.set(gateId, {
        id: gateId,
        node_id: nodeId,
        topic,
        current_rank: 'E',
        cleared_count: 0,
        created_at: new Date().toISOString(),
      });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('map_nodes')
          .update({ is_unlocked: true })
          .eq('id', nodeId);

        if (topic) {
          await supabase.from('gates').insert({
            node_id: nodeId,
            topic,
            current_rank: 'E',
          });
        }
      } catch (err) {
        console.warn('Supabase node unlock failed:', err);
      }
    }

    return {
      success: true,
      message: `Map Node ${nodeId} unlocked successfully.`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to unlock map node',
    };
  }
}
