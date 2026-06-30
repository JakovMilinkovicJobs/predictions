-- World Cup Prediction League Database Schema
-- Migration: 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Leagues table
CREATE TABLE leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    invite_code TEXT UNIQUE NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on leagues
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

-- Leagues policies
-- TODO: Before production, tighten these policies
CREATE POLICY "Users can view leagues they are members of"
    ON leagues FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM league_members
            WHERE league_members.league_id = leagues.id
            AND league_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create leagues"
    ON leagues FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "League owners can update their leagues"
    ON leagues FOR UPDATE
    USING (auth.uid() = owner_id);

-- League members table
CREATE TABLE league_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(league_id, user_id)
);

-- Enable RLS on league_members
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;

-- League members policies
CREATE POLICY "Users can view members of leagues they belong to"
    ON league_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM league_members lm
            WHERE lm.league_id = league_members.league_id
            AND lm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join leagues with invite code"
    ON league_members FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM leagues
            WHERE leagues.id = league_id
        )
    );

-- TODO: Add policy for league owner to remove members
CREATE POLICY "League owners can remove members"
    ON league_members FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM leagues
            WHERE leagues.id = league_members.league_id
            AND leagues.owner_id = auth.uid()
        )
    );

-- Matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    kickoff_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
    actual_home_score INTEGER,
    actual_away_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Matches policies
CREATE POLICY "Users can view matches in their leagues"
    ON matches FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM league_members
            WHERE league_members.league_id = matches.league_id
            AND league_members.user_id = auth.uid()
        )
    );

CREATE POLICY "League owners can create matches"
    ON matches FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM leagues
            WHERE leagues.id = league_id
            AND leagues.owner_id = auth.uid()
        )
    );

CREATE POLICY "League owners can update matches"
    ON matches FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM leagues
            WHERE leagues.id = matches.league_id
            AND leagues.owner_id = auth.uid()
        )
    );

-- Predictions table
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    predicted_home_score INTEGER NOT NULL,
    predicted_away_score INTEGER NOT NULL,
    predicted_outcome TEXT NOT NULL CHECK (predicted_outcome IN ('1', 'X', '2')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(match_id, user_id)
);

-- Enable RLS on predictions
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Predictions policies
CREATE POLICY "Users can view predictions in their leagues"
    ON predictions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM league_members
            WHERE league_members.league_id = predictions.league_id
            AND league_members.user_id = auth.uid()
        )
    );

-- Users can insert their own predictions before kickoff
-- TODO: Before production, add kickoff time check in application layer
-- RLS doesn't have easy access to match kickoff_time without complex join
CREATE POLICY "Users can create predictions in their leagues"
    ON predictions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM league_members
            WHERE league_members.league_id = predictions.league_id
            AND league_members.user_id = auth.uid()
        )
    );

-- Users can update their own predictions before kickoff
-- TODO: Before production, add kickoff time check in application layer
CREATE POLICY "Users can update own predictions"
    ON predictions FOR UPDATE
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for predictions updated_at
CREATE TRIGGER update_predictions_updated_at
    BEFORE UPDATE ON predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate a random invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- TODO Future improvements:
-- 1. Add function to calculate leaderboard in database instead of client-side
-- 2. Add policy to hide other users' predictions before kickoff
-- 3. Add audit log table for result changes
-- 4. Add indexes for performance on large datasets
-- 5. Add check constraint or trigger to prevent prediction updates after kickoff
-- 6. Add table for World Cup teams and automatic match import
-- 7. Add notification settings table
-- 8. Strengthen RLS policies before production deployment
