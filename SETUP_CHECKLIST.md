# Setup Checklist

## 🎯 Quick Setup Checklist

Follow these steps in order:

### ☐ 1. Install Dependencies (if not done)
```bash
npm install
```

### ☐ 2. Verify Environment File
- [ ] Check that `src/environments/environment.ts` exists
- [ ] Verify it has your Supabase URL and anon key
- [ ] URL should be: `https://sajiznrabalnmldrnyyf.supabase.co`

### ☐ 3. Apply Database Migrations

Go to: https://app.supabase.com/project/sajiznrabalnmldrnyyf/sql/new

**Migration 1:** Run `supabase/migrations/001_initial_schema.sql`
- [ ] Copy entire file contents
- [ ] Paste in SQL Editor
- [ ] Click Run
- [ ] Should see "Success. No rows returned"

**Migration 2:** Run `supabase/migrations/002_add_competitions_and_scoring.sql`
- [ ] Copy entire file contents
- [ ] Paste in SQL Editor
- [ ] Click Run
- [ ] Should see "Success. No rows returned"

### ☐ 4. Verify Database Tables

Go to: https://app.supabase.com/project/sajiznrabalnmldrnyyf/editor

Check these tables exist:
- [ ] competitions (should have 4 rows)
- [ ] leagues
- [ ] league_members
- [ ] matches
- [ ] predictions
- [ ] profiles

### ☐ 5. Test Build
```bash
npm run build
```
- [ ] Build completes successfully
- [ ] May show CSS warning (ignore it)

### ☐ 6. Start Development Server
```bash
npm start
```
- [ ] App opens at http://localhost:4200
- [ ] No console errors
- [ ] You see the leagues page

### ☐ 7. Test Core Features

**Create League:**
- [ ] Click "Create League"
- [ ] See competition dropdown populated
- [ ] Fill form and submit
- [ ] League created successfully
- [ ] You're redirected to league detail

**Check Database:**
- [ ] Go to Supabase Table Editor
- [ ] See your league in `leagues` table
- [ ] See yourself in `league_members` table
- [ ] See your profile in `profiles` table

### ☐ 8. Optional: Test Database Connection
```bash
npm run db:status
```
- [ ] All checks pass
- [ ] All tables accessible

---

## ✅ Setup Complete!

If all checkboxes are checked, your app is ready to use!

### Next Steps:
1. Read `TESTING_GUIDE.md` for detailed testing scenarios
2. Read `README_DATABASE.md` for database management
3. Start building the remaining features!

### 📚 Documentation Files:
- **TESTING_GUIDE.md** - How to test all features
- **README_DATABASE.md** - Database management and queries
- **SETUP_CHECKLIST.md** - This file

### 🚀 Current Status:

**✅ Completed Features:**
- Database schema with competitions and scoring rules
- Models and services
- Authentication flow (email/password, OAuth ready)
- Create league with all new fields
- Join league with validation
- Scoring service with league-specific rules

**🚧 To Be Built:**
- League detail page with 3 tabs
- Match management (admin page)
- Prediction form
- Scoreboard/leaderboard
- Match detail page
- Responsive styling
- Shared components

**📝 Ready for Development:**
- All foundation is in place
- Database is ready
- Services are ready
- Just need to build UI components

---

## ⚠️ Common Issues

**Problem:** Can't see competitions dropdown
- **Solution:** Run migration 002

**Problem:** "relation does not exist" error
- **Solution:** Run both migrations in Supabase SQL Editor

**Problem:** App shows blank page
- **Solution:** Check browser console, verify environment.ts exists

**Problem:** Build fails
- **Solution:** Run `npm install` first

---

## 🆘 Need Help?

1. Check browser console (F12) for errors
2. Check Supabase Dashboard > Logs
3. Verify all migrations ran successfully
4. Check that environment.ts has correct credentials

Good luck! 🎉
