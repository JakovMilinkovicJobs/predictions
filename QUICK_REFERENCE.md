# Quick Reference Card

## 📁 Your Folder Structure (Perfect!)

```
✅ supabase/
   └── migrations/
       ├── 001_initial_schema.sql
       └── 002_add_competitions_and_scoring.sql
```

**Status:** ✅ Ready for GitHub Integration!

## 🚀 Quick Commands

```bash
# Development
npm start                    # Start dev server (port 4200)
npm run build               # Production build
npm test                    # Run tests

# Database
npm run db:status           # Check database connection
npm run db:info             # View database guide

# Git
git status                  # Check changes
git add .                   # Stage all changes
git commit -m "message"     # Commit
git push                    # Push to GitHub
```

## 📚 Documentation Quick Links

| Need | File |
|------|------|
| **First time setup** | `SETUP_CHECKLIST.md` ⭐ |
| **Test the app** | `TESTING_GUIDE.md` |
| **GitHub setup** | `scripts/setup-github-integration.md` |
| **Database queries** | `README_DATABASE.md` |
| **Folder structure** | `SUPABASE_FOLDER_STRUCTURE.md` |
| **Detailed GitHub** | `GITHUB_SUPABASE_SETUP.md` |

## 🎯 Supabase Links

| Page | URL |
|------|-----|
| **Dashboard** | https://app.supabase.com/project/sajiznrabalnmldrnyyf |
| **SQL Editor** | .../sql/new |
| **Table Editor** | .../editor |
| **Integrations** | .../settings/integrations |
| **API Settings** | .../settings/api |

## 🗂️ Required Folder Structure

### Minimum (What You Have) ✅
```
supabase/
└── migrations/
    └── *.sql files
```

### Full (Optional - If Using CLI)
```
supabase/
├── config.toml          # Project config
├── migrations/          # Database migrations ✅
├── functions/           # Edge Functions (optional)
├── seed.sql            # Test data (optional)
└── tests/              # DB tests (optional)
```

## 🔄 Migration Workflow

### Manual Approach (Current)
1. Create: `supabase/migrations/003_feature.sql`
2. Go to Supabase SQL Editor
3. Copy/paste file contents
4. Run query
5. Done!

### GitHub Approach (After Setup)
1. Create: `supabase/migrations/003_feature.sql`
2. `git add . && git commit -m "feat: add feature"`
3. `git push`
4. Supabase auto-applies! 🎉

## 📝 Migration Naming

### Your Style (Good!) ✅
```
001_initial_schema.sql
002_add_competitions_and_scoring.sql
003_next_feature.sql
```

### CLI Auto-generated Style
```
20240630120000_initial_schema.sql
20240701130000_add_competitions.sql
```

Both work perfectly!

## ✅ Checklist for GitHub Integration

- [ ] Code pushed to GitHub
- [ ] Supabase Dashboard → Settings → Integrations
- [ ] Connect GitHub repository
- [ ] Select branch: `main`
- [ ] Migrations directory: `supabase/migrations`
- [ ] Test: Push new migration file
- [ ] Verify: Check it auto-applies

## 🎨 Your Project Status

### ✅ Completed
- Database schema with all tables
- Models and TypeScript interfaces
- Services (auth, league, competition, scoring)
- Auth flow (email/password + OAuth ready)
- Create league page (with competitions + scoring rules)
- Join league (with validation)
- Route guards
- Environment setup
- Migrations ready for deployment

### 🚧 To Build
- League detail page with 3 tabs
- Match management (admin)
- Prediction forms
- Leaderboard display
- Match detail page
- Mobile-first responsive CSS
- Shared components (match-card, prediction-form)

## 🔐 Environment Variables

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  supabase: {
    url: 'https://sajiznrabalnmldrnyyf.supabase.co',
    anonKey: 'your-anon-key-here'
  }
};
```

## 📊 Database Tables

```
profiles          - User profiles
competitions      - Soccer tournaments (4 sample rows)
leagues           - Prediction leagues
league_members    - Membership junction table
matches           - Match fixtures
predictions       - User predictions
```

## 🎯 Next Steps

1. ✅ **Now:** Run migrations manually (5 min)
   - See `TESTING_GUIDE.md`

2. ✅ **Test:** Create league, join league (10 min)
   - `npm start` → http://localhost:4200

3. 🔜 **Later:** Setup GitHub integration (5 min)
   - See `scripts/setup-github-integration.md`

4. 🚀 **Future:** Build remaining features
   - League detail tabs
   - Prediction forms
   - Leaderboard

## 🆘 Common Commands

```bash
# Check if migrations applied
npm run db:status

# View database guide
npm run db:info

# Build the app
npm run build

# Start dev server
npm start

# Check git status
git status

# Create new migration (manually)
echo "CREATE TABLE..." > supabase/migrations/003_new_feature.sql
```

## 📞 Need Help?

1. **Setup issues** → `SETUP_CHECKLIST.md`
2. **Testing** → `TESTING_GUIDE.md`
3. **GitHub** → `scripts/setup-github-integration.md`
4. **Database** → `README_DATABASE.md`
5. **Folder structure** → `SUPABASE_FOLDER_STRUCTURE.md`

---

**Everything is ready! Your folder structure is perfect! ✅**
