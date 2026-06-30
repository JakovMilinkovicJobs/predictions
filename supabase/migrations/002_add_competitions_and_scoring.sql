-- Migration: 002_add_competitions_and_scoring.sql
-- Add competitions table and update leagues with scoring rules

-- Competitions table
CREATE TABLE competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    season TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on competitions
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

-- Competitions policies - everyone can view
CREATE POLICY "Anyone can view competitions"
    ON competitions FOR SELECT
    USING (true);

-- Only admins can create/update competitions (for now allow authenticated users)
CREATE POLICY "Authenticated users can create competitions"
    ON competitions FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Add competition_id to leagues
ALTER TABLE leagues ADD COLUMN competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL;

-- Add scoring rules to leagues
ALTER TABLE leagues ADD COLUMN points_exact_score INTEGER DEFAULT 3 NOT NULL;
ALTER TABLE leagues ADD COLUMN points_outcome INTEGER DEFAULT 1 NOT NULL;

-- Add max participants to leagues
ALTER TABLE leagues ADD COLUMN max_participants INTEGER DEFAULT 50 CHECK (max_participants > 0);

-- Add competition_id to matches (optional - matches can be league-specific or competition-wide)
ALTER TABLE matches ADD COLUMN competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_leagues_competition ON leagues(competition_id);
CREATE INDEX idx_matches_competition ON matches(competition_id);
CREATE INDEX idx_matches_league ON matches(league_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_league_members_league ON league_members(league_id);
CREATE INDEX idx_league_members_user ON league_members(user_id);

-- Insert some sample competitions
INSERT INTO competitions (name, description, season, start_date, end_date) VALUES
    ('FIFA World Cup 2026', 'The 2026 FIFA World Cup', '2026', '2026-06-11', '2026-07-19'),
    ('UEFA Champions League', 'UEFA Champions League 2024/25', '2024/25', '2024-09-17', '2025-05-31'),
    ('English Premier League', 'Premier League 2024/25', '2024/25', '2024-08-16', '2025-05-25'),
    ('UEFA Euro 2024', 'UEFA European Championship 2024', '2024', '2024-06-14', '2024-07-14');
