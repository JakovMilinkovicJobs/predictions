# GitHub + Supabase Integration Setup

This guide explains how to use GitHub with Supabase for automatic migrations and better version control.

## Why Use GitHub Integration?

✅ **Automatic Deployments** - Push code → Migrations run automatically
✅ **Version Control** - All database changes tracked in Git
✅ **Collaboration** - Team members can review migration PRs
✅ **Rollback** - Easy to revert problematic migrations
✅ **Preview Branches** - Test migrations before production

## Option A: Supabase GitHub Integration (Recommended)

This is the **easiest and best** option for most projects.

### Step 1: Prepare Your Repository

First, let's organize migrations in the Supabase-expected structure:

```bash
# Current structure (good!)
supabase/
  └── migrations/
      ├── 001_initial_schema.sql
      └── 002_add_competitions_and_scoring.sql
```

This structure is already correct! ✅

### Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "feat: initial setup with migrations"

# Create GitHub repo and push
# Go to github.com and create a new repo
# Then:
git remote add origin https://github.com/YOUR_USERNAME/world-cup-prediction-league.git
git branch -M main
git push -u origin main
```

### Step 3: Connect GitHub to Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com/project/sajiznrabalnmldrnyyf

2. Click **Settings** (gear icon) in left sidebar

3. Click **Integrations**

4. Find **GitHub** section

5. Click **Connect to GitHub**

6. Authorize Supabase to access your GitHub

7. Select your repository: `world-cup-prediction-league`

8. Configure:
   - **Branch for Production**: `main`
   - **Migrations Directory**: `supabase/migrations`

9. Click **Connect**

### Step 4: How It Works

Now when you:

1. Create new migration file: `supabase/migrations/003_new_feature.sql`
2. Commit and push to GitHub
3. Supabase automatically detects and runs the migration! 🎉

### Step 5: First Sync

After connecting, Supabase will:
- Scan your `supabase/migrations/` folder
- Compare with database state
- Run any missing migrations

**Important:** If you already ran migrations manually via SQL Editor, Supabase needs to know about them.

Go to Supabase Dashboard → Database → Migrations and verify the status.

---

## Option B: Supabase CLI + GitHub (More Control)

If you want more control or need local development.

### Step 1: Install Supabase CLI Globally

```bash
npm install -g supabase
# or
brew install supabase/tap/supabase  # macOS
```

### Step 2: Initialize Supabase Project

```bash
# This creates supabase config
supabase init
```

This creates:
```
supabase/
  ├── config.toml
  └── migrations/
```

### Step 3: Link to Remote Project

```bash
supabase link --project-ref sajiznrabalnmldrnyyf
```

You'll need to enter your database password (check Supabase Dashboard → Settings → Database).

### Step 4: Create New Migrations

```bash
# Create a new migration file
supabase migration new add_feature_name

# This creates:
# supabase/migrations/20240101120000_add_feature_name.sql
```

### Step 5: Apply Migrations

```bash
# Apply to remote database
supabase db push

# Or apply specific migration
supabase migration up
```

### Step 6: Set Up GitHub Actions

Create `.github/workflows/deploy-migrations.yml`:

```yaml
name: Deploy Database Migrations

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link Supabase Project
        run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Run Migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

Add secrets to GitHub:
- `SUPABASE_PROJECT_REF`: `sajiznrabalnmldrnyyf`
- `SUPABASE_ACCESS_TOKEN`: Get from Supabase Dashboard → Settings → API
- `SUPABASE_DB_PASSWORD`: Your database password

---

## Option C: Simple CLI Usage (Current Approach)

You can continue using CLI manually:

### Apply Migrations Locally

```bash
# Connect to remote database
npx supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.sajiznrabalnmldrnyyf.supabase.co:5432/postgres"
```

### Create New Migration

```bash
npx supabase migration new add_new_feature
```

---

## Migration Naming Conventions

Use descriptive names with timestamps:

```
20240630_001_initial_schema.sql
20240630_002_add_competitions_and_scoring.sql
20240701_003_add_match_notifications.sql
20240702_004_add_user_avatars.sql
```

Or Supabase auto-generates:
```
20240630120000_initial_schema.sql
```

---

## Best Practices

### 1. Never Edit Old Migrations
Once a migration is applied, never edit it. Create a new migration instead.

❌ **Don't:**
```sql
-- Edit 001_initial_schema.sql to add column
```

✅ **Do:**
```sql
-- Create 003_add_column.sql
ALTER TABLE leagues ADD COLUMN new_field TEXT;
```

### 2. Test Migrations Locally First

```bash
# Start local Supabase
supabase start

# Test migration locally
supabase migration up

# If good, push to remote
supabase db push
```

### 3. Use Rollback Migrations

Create separate files for rollback:

```
003_add_feature.sql        # Up migration
003_add_feature.down.sql   # Down migration (rollback)
```

### 4. Review Before Merging

Always review migrations in PRs before merging to main/production.

### 5. Backup Before Major Changes

```bash
# Backup database
supabase db dump -f backup.sql
```

---

## Migration Workflow Example

### Scenario: Add new feature

1. **Create branch**
   ```bash
   git checkout -b feature/add-notifications
   ```

2. **Create migration**
   ```bash
   npx supabase migration new add_notifications
   ```

3. **Write SQL**
   ```sql
   -- supabase/migrations/003_add_notifications.sql
   CREATE TABLE notifications (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     message TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

4. **Test locally** (optional)
   ```bash
   supabase start
   supabase migration up
   ```

5. **Commit and push**
   ```bash
   git add supabase/migrations/003_add_notifications.sql
   git commit -m "feat: add notifications table"
   git push origin feature/add-notifications
   ```

6. **Create PR on GitHub**

7. **After merge** → Supabase automatically applies migration! 🎉

---

## Current State of Your Project

You have:
- ✅ `supabase/migrations/` folder correctly set up
- ✅ Two migration files ready
- ✅ Correct folder structure

### Quick Start (Choose One):

**For Quick Testing (Now):**
1. Run migrations via Supabase SQL Editor (manual)
2. See TESTING_GUIDE.md

**For Production Workflow (After testing works):**
1. Push code to GitHub
2. Connect GitHub to Supabase (Option A above)
3. Future migrations = automatic! 🚀

---

## Comparison Table

| Feature | Manual SQL Editor | GitHub Integration | CLI + GitHub Actions |
|---------|-------------------|-------------------|---------------------|
| Ease of Setup | ⭐⭐⭐ Easy | ⭐⭐ Medium | ⭐ Advanced |
| Version Control | ❌ No | ✅ Yes | ✅ Yes |
| Automatic Deploy | ❌ No | ✅ Yes | ✅ Yes |
| Team Collaboration | ❌ Hard | ✅ Easy | ✅ Easy |
| Rollback Support | ❌ Manual | ✅ Git revert | ✅ Git revert |
| Testing Before Prod | ❌ No | ⚠️ Limited | ✅ Full control |
| **Best For** | Quick dev/testing | Most projects | Advanced workflows |

---

## My Recommendation

### For Now (Testing Phase):
Use **Manual SQL Editor** (TESTING_GUIDE.md) - fastest to get started

### After Testing Works:
Switch to **GitHub Integration** (Option A) - best balance of simplicity and features

### For Production at Scale:
Consider **CLI + GitHub Actions** (Option B) - maximum control

---

## Next Steps

1. ✅ **Immediate:** Run migrations manually (TESTING_GUIDE.md) to test the app

2. 🔜 **After testing works:** Push to GitHub and set up integration

3. 🚀 **Going forward:** All new migrations via GitHub = automatic deployment!

Would you like me to help set up any of these options?
