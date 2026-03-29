-- DownfieldOS Initial Schema
-- Run this in Supabase SQL editor to set up the database

-- User preferences (team selection, UI settings, etc.)
CREATE TABLE IF NOT EXISTS user_preferences (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- Saved matchup analyses
CREATE TABLE IF NOT EXISTS saved_matchups (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT NOT NULL,
  off_team TEXT NOT NULL,
  def_team TEXT NOT NULL,
  grade TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fantasy tracking (Phase 2 Pro feature, schema ready)
CREATE TABLE IF NOT EXISTS fantasy_rosters (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT NOT NULL,
  league_name TEXT,
  player_name TEXT NOT NULL,
  team TEXT NOT NULL,
  position TEXT NOT NULL,
  is_starter BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_matchups ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_rosters ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users manage own preferences" ON user_preferences
  FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "Users manage own matchups" ON saved_matchups
  FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "Users manage own fantasy rosters" ON fantasy_rosters
  FOR ALL USING (user_id = auth.uid()::text);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_prefs_user ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_matchups_user ON saved_matchups(user_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_user ON fantasy_rosters(user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
