# Testing Guide

## ✅ Step 1: Apply Database Migrations

**IMPORTANT: You must do this first before running the app!**

### Option A: Manual via SQL Editor (Quick - 5 minutes)

**Best for:** Immediate testing

1. Go to your Supabase Dashboard: https://app.supabase.com/project/sajiznrabalnmldrnyyf

2. Click **SQL Editor** in the left sidebar

3. Click **New Query**

4. Open `supabase/migrations/001_initial_schema.sql` in a text editor

5. Copy the entire contents and paste into the SQL Editor

6. Click **Run** (or press Ctrl+Enter)

7. You should see "Success. No rows returned"

8. Repeat steps 3-7 for `supabase/migrations/002_add_competitions_and_scoring.sql`

### Option B: GitHub Integration (Recommended for production)

**Best for:** Team collaboration and automatic deployments

See `scripts/setup-github-integration.md` for detailed setup.

**Quick version:**
1. Push code to GitHub
2. Connect GitHub repo in Supabase Dashboard → Settings → Integrations
3. Migrations auto-apply on push! 🚀

**Pros:** Version control, automatic, team-friendly
**Cons:** 5 min setup time

Choose **Option A** for immediate testing, then switch to **Option B** later for production workflow.

## ✅ Step 2: Verify Database Setup

In the Supabase Dashboard:

1. Click **Table Editor** in the left sidebar

2. You should see these tables:
   - ✓ competitions
   - ✓ leagues
   - ✓ league_members
   - ✓ matches
   - ✓ predictions
   - ✓ profiles

3. Click on **competitions** table

4. You should see 4 sample competitions:
   - FIFA World Cup 2026
   - UEFA Champions League
   - English Premier League
   - UEFA Euro 2024

If you see all of this, your database is ready! ✅

## ✅ Step 3: Start the Development Server

```bash
npm start
```

The app will open at: http://localhost:4200

## ✅ Step 4: Test the App Flow

### Test 1: App Loads
- ✓ App should load without errors
- ✓ You should be automatically signed in anonymously
- ✓ You should see the leagues page (empty at first)

### Test 2: Create a League
1. Click **"Create League"** button
2. Fill in the form:
   - League Name: "My Test League"
   - Description: Optional
   - Competition: Select "FIFA World Cup 2026"
   - Points for Exact Score: 3 (default)
   - Points for Correct Outcome: 1 (default)
   - Maximum Participants: 50 (default)
3. Click **"Create League"**
4. ✓ You should be redirected to the league detail page
5. ✓ You should see your league

### Test 3: Join a League
1. Go back to leagues page
2. When you created a league, you got an invite code (8 characters like "ABC12XY3")
3. Click **"Join League"**
4. Enter the invite code
5. ✓ You should join the league (or see "already a member" if it's your league)

### Test 4: Check Supabase Data
Go back to Supabase Dashboard > Table Editor:

1. Click **leagues** table
   - ✓ You should see your created league
   - ✓ It should have the invite_code, competition_id, and scoring rules

2. Click **league_members** table
   - ✓ You should see yourself as a member
   - ✓ Your role should be "owner"

3. Click **profiles** table
   - ✓ You should see your auto-generated profile
   - ✓ Display name like "Player1234"

## ✅ Step 5: Test Database Connection Script

```bash
npm run db:status
```

This will check if all database tables are accessible.

Expected output:
```
✓ Connecting to: https://sajiznrabalnmldrnyyf.supabase.co
✓ Competitions table exists (4 competitions found)
✓ Leagues table accessible
✓ Profiles table accessible
✓ Matches table accessible
✓ Predictions table accessible

✅ All database checks passed!
```

## Common Issues & Solutions

### Issue: "relation does not exist" error
**Solution:** You haven't run the migrations yet. Go back to Step 1.

### Issue: App shows blank page
**Solution:**
1. Check browser console for errors (F12)
2. Make sure environment.ts has correct Supabase credentials
3. Check that migrations are applied

### Issue: Can't create league
**Solution:**
1. Check that competitions table has data
2. Verify user is authenticated (check browser console)
3. Check that environment.ts is not in .gitignore issues

### Issue: "Invalid invite code" when joining
**Solution:**
1. Make sure you're using the correct 8-character code
2. Codes are case-insensitive but check for typos
3. Check that the league exists in Supabase

### Issue: Build warning about CSS size
**Solution:** This is just a warning, not an error. The app works fine. You can ignore it for now.

## Next Steps for Testing

Once basic features work, test these scenarios:

### Scenario 1: Multiple Users
1. Open app in incognito window (simulates different user)
2. Create/join leagues
3. Verify both users see different profiles

### Scenario 2: Full League Flow
1. Create a league
2. Add matches (you'll need the admin page for this)
3. Make predictions
4. Set match as finished with real scores
5. Check leaderboard

### Scenario 3: Privacy
1. Create prediction for future match
2. Open in incognito (different user)
3. Verify other users can't see your prediction before match starts
4. After match starts, verify predictions become visible

## Performance Testing

```bash
# Build for production
npm run build

# Check bundle sizes
ls -lh dist/world-cup-prediction-league/browser/
```

## Development Commands

```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test

# Check database
npm run db:status

# View database guide
npm run db:info
```

## Useful Browser DevTools Tips

1. **Network Tab**: Check API calls to Supabase
2. **Console Tab**: Check for JavaScript errors
3. **Application Tab**:
   - Check localStorage for user data
   - Check Cookies for Supabase auth

## Supabase Dashboard Useful Queries

### View all leagues with member count
```sql
SELECT
  l.name,
  l.invite_code,
  c.name as competition,
  COUNT(lm.id) as members
FROM leagues l
LEFT JOIN competitions c ON l.competition_id = c.id
LEFT JOIN league_members lm ON l.id = lm.league_id
GROUP BY l.id, l.name, l.invite_code, c.name;
```

### View user profiles
```sql
SELECT * FROM profiles ORDER BY created_at DESC;
```

### Delete all test data (CAREFUL!)
```sql
-- Delete predictions
DELETE FROM predictions;

-- Delete matches
DELETE FROM matches;

-- Delete league members
DELETE FROM league_members;

-- Delete leagues
DELETE FROM leagues;

-- Profiles will remain for users
```

## Need Help?

- Check README_DATABASE.md for database management
- Check browser console for errors
- Check Supabase logs in Dashboard > Logs
- Verify migrations are applied correctly

Happy Testing! 🎉
