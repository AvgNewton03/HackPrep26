-- LevelUp Database Schema for Supabase (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Hunters (Users Profile Table)
CREATE TABLE IF NOT EXISTS public.hunters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  mana_xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  highest_streak INTEGER NOT NULL DEFAULT 0,
  hunter_class TEXT NOT NULL DEFAULT 'E-Rank Hunter',
  last_login_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Map Nodes (Interactive 2D City Map State)
CREATE TABLE IF NOT EXISTS public.map_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  x_coord DOUBLE PRECISION NOT NULL,
  y_coord DOUBLE PRECISION NOT NULL,
  is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  owner_id UUID REFERENCES public.hunters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Gates (Subjects / Topics tied to Nodes)
CREATE TABLE IF NOT EXISTS public.gates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id UUID REFERENCES public.map_nodes(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  current_rank TEXT NOT NULL DEFAULT 'E' CHECK (current_rank IN ('E', 'D', 'C', 'B', 'A', 'S')),
  cleared_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Raid History (Quiz Logs & Performance Validation)
CREATE TABLE IF NOT EXISTS public.raid_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hunter_id UUID REFERENCES public.hunters(id) ON DELETE CASCADE,
  gate_id UUID REFERENCES public.gates(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 5),
  time_taken INTEGER NOT NULL CHECK (time_taken >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance queries
CREATE INDEX IF NOT EXISTS idx_hunters_mana_xp ON public.hunters(mana_xp DESC);
CREATE INDEX IF NOT EXISTS idx_gates_node_id ON public.gates(node_id);
CREATE INDEX IF NOT EXISTS idx_raid_history_hunter ON public.raid_history(hunter_id);
CREATE INDEX IF NOT EXISTS idx_raid_history_gate ON public.raid_history(gate_id);

-- Row Level Security (RLS) setup
ALTER TABLE public.hunters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raid_history ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for MVP demo usage
CREATE POLICY "Allow public read access on hunters" ON public.hunters FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on hunters" ON public.hunters FOR ALL USING (true);

CREATE POLICY "Allow public read access on map_nodes" ON public.map_nodes FOR SELECT USING (true);
CREATE POLICY "Allow public write on map_nodes" ON public.map_nodes FOR ALL USING (true);

CREATE POLICY "Allow public read access on gates" ON public.gates FOR SELECT USING (true);
CREATE POLICY "Allow public write on gates" ON public.gates FOR ALL USING (true);

CREATE POLICY "Allow public read access on raid_history" ON public.raid_history FOR SELECT USING (true);
CREATE POLICY "Allow public write on raid_history" ON public.raid_history FOR ALL USING (true);

-- Mock Seed Data
INSERT INTO public.hunters (id, username, level, mana_xp, current_streak, highest_streak, hunter_class)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'SungJinWoo', 50, 45000, 30, 45, 'National Level Hunter'),
  ('00000000-0000-0000-0000-000000000002', 'ChaHaeIn', 35, 28000, 14, 20, 'S-Rank Hunter'),
  ('00000000-0000-0000-0000-000000000003', 'GoGunHee', 28, 19500, 10, 15, 'A-Rank Hunter'),
  ('00000000-0000-0000-0000-000000000004', 'CodeNinja99', 5, 1240, 7, 14, 'E-Rank Hunter')
ON CONFLICT (id) DO NOTHING;

-- Initial Map Nodes (Safe Zone & Gate Locations)
INSERT INTO public.map_nodes (id, x_coord, y_coord, is_unlocked, owner_id)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 50.0, 50.0, true, '00000000-0000-0000-0000-000000000004'),
  ('22222222-2222-2222-2222-222222222222', 30.0, 40.0, true, '00000000-0000-0000-0000-000000000004'),
  ('33333333-3333-3333-3333-333333333333', 70.0, 60.0, false, '00000000-0000-0000-0000-000000000004'),
  ('44444444-4444-4444-4444-444444444444', 20.0, 80.0, false, '00000000-0000-0000-0000-000000000004')
ON CONFLICT (id) DO NOTHING;

-- Initial Gates
INSERT INTO public.gates (id, node_id, topic, current_rank, cleared_count)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'React Hooks', 'E', 2),
  ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'PostgreSQL Queries', 'D', 1),
  ('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Next.js App Router', 'E', 0)
ON CONFLICT (id) DO NOTHING;
