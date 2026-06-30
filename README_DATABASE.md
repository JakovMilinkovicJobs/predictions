# Database Management Guide

This guide will help you manage your Supabase database for the World Cup Prediction League app.

## Prerequisites

- Node.js and npm installed ✓
- Supabase account and project created
- Supabase credentials in `src/environments/environment.ts`

## Quick Start

### 1. Apply Migrations to Your Supabase Database

You have two SQL migration files that need to be run in your Supabase database:
- `supabase/migrations/001_initial_schema.sql` - Core tables
- `supabase/migrations/002_add_competitions_and_scoring.sql` - Competitions and scoring rules

**Option A: Via Supabase Dashboard (Recommended for first time)**

1. Go to https://app.supabase.com
2. Select your project: `sajiznrabalnmldrnyyf`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
6. Click **Run** or press Ctrl+Enter
7. Repeat steps 4-6 for `002_add_competitions_and_scoring.sql`

**Option B: Using npm scripts**

```bash
# Run both migrations
npm run db:migrate

# Or run individual migrations
npm run db:migrate:001
npm run db:migrate:002
```

### 2. Verify Database Schema

After running migrations, verify your database has these tables:
- `profiles`
- `competitions` (NEW)
- `leagues`
- `league_members`
- `matches`
- `predictions`

**Check in Supabase Dashboard:**
1. Go to **Table Editor** in left sidebar
2. You should see all 6 tables listed

### 3. Check Sample Data

The migration automatically inserts sample competitions:
- FIFA World Cup 2026
- UEFA Champions League 2024/25
- English Premier League 2024/25
- UEFA Euro 2024

**Verify in SQL Editor:**
```sql
SELECT * FROM competitions;
```

## Database Schema Overview

### competitions
- Stores soccer competitions/leagues/cups
- Pre-populated with sample data

### leagues
- User-created prediction leagues
- Links to a competition
- Has scoring rules: `points_exact_score`, `points_outcome`
- Has `max_participants` limit
- Has unique `invite_code` for joining

### league_members
- Junction table for league membership
- Links users to leagues
- Tracks role (owner/member)

### matches
- Matches within a league
- Has `kickoff_time`, teams, status
- Has actual scores when finished

### predictions
- User predictions for matches
- Has predicted scores and outcome (1/X/2)
- Cannot be edited after match starts
- Unique per (match, user)

### profiles
- User profile data
- Auto-created on signup
- Has display_name

## Common Tasks

### Add More Sample Competitions

```sql
INSERT INTO competitions (name, description, season, start_date, end_date)
VALUES ('La Liga', 'Spanish La Liga 2024/25', '2024/25', '2024-08-17', '2025-05-25');
```

### Check All Leagues

```sql
SELECT
  l.*,
  c.name as competition_name,
  COUNT(lm.id) as member_count
FROM leagues l
LEFT JOIN competitions c ON l.competition_id = c.id
LEFT JOIN league_members lm ON l.league_id = lm.league_id
GROUP BY l.id, c.name;
```

### View Leaderboard for a League

```sql
-- Replace 'YOUR_LEAGUE_ID' with actual league ID
SELECT
  p.display_name,
  COUNT(pred.id) as total_predictions,
  -- Note: Points calculation would be done in application
  SUM(
    CASE
      WHEN pred.predicted_home_score = m.actual_home_score
        AND pred.predicted_away_score = m.actual_away_score
      THEN l.points_exact_score
      ELSE 0
    END
  ) as points
FROM predictions pred
JOIN profiles p ON pred.user_id = p.id
JOIN matches m ON pred.match_id = m.id
JOIN leagues l ON pred.league_id = l.id
WHERE pred.league_id = 'YOUR_LEAGUE_ID'
  AND m.status = 'finished'
GROUP BY p.id, p.display_name
ORDER BY points DESC;
```

### Reset Database (CAREFUL!)

```sql
-- This will delete ALL data
TRUNCATE predictions CASCADE;
TRUNCATE matches CASCADE;
TRUNCATE league_members CASCADE;
TRUNCATE leagues CASCADE;
TRUNCATE competitions CASCADE;
TRUNCATE profiles CASCADE;

-- Then re-run migration 002 to restore sample competitions
```

## Testing Locally

### Option 1: Use Your Remote Supabase (Current Setup)
Your app is already configured to use the remote Supabase at:
- URL: `https://sajiznrabalnmldrnyyf.supabase.co`
- This is the easiest for testing

### Option 2: Local Supabase (Advanced)
If you want to test with a local database:

```bash
# Initialize Supabase locally
npx supabase init

# Start local Supabase
npx supabase start

# This will give you local credentials
# Update src/environments/environment.ts with local URL/key

# Apply migrations
npx supabase db reset
```

## Troubleshooting

### Error: "relation does not exist"
- You haven't run the migrations yet
- Run migrations via Supabase Dashboard SQL Editor

### Error: "permission denied" or RLS policy errors
- Check that RLS policies are properly set up
- Verify user is authenticated
- Check browser console for auth errors

### Can't create league
- Verify `competitions` table has data
- Check that migration 002 ran successfully
- Verify user is authenticated

### Predictions not showing
- Check if match `kickoff_time` has passed
- Predictions are hidden before match starts (privacy feature)
- Verify RLS policies allow reading

## Useful Supabase Dashboard Links

- **SQL Editor**: Run queries and migrations
- **Table Editor**: View and edit data manually
- **Auth**: Manage users
- **Database > Roles**: Check RLS policies
- **Logs**: Debug errors

## Production Deployment

When deploying to production:

1. Create a production Supabase project
2. Run migrations on production database
3. Update `src/environments/environment.prod.ts` with production credentials
4. Build app: `npm run build`
5. Deploy to Vercel or your hosting provider

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Your Supabase Project: https://app.supabase.com/project/sajiznrabalnmldrnyyf
