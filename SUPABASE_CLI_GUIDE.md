# Supabase CLI Migration Guide

Since GitHub Connections UI isn't available, use Supabase CLI for migrations.

## 🚀 Quick Setup

### Step 1: Link Your Project

```bash
npx supabase link --project-ref jpvykalpweurxdgcvahi
```

When prompted:
- Enter your **database password** (from Supabase Dashboard → Settings → Database)
- Or use your **access token** (from Supabase Dashboard → Settings → API → Service Role Key)

### Step 2: Push Migrations to Supabase

After linking, push your migrations:

```bash
npx supabase db push
```

This will:
- ✅ Read all `.sql` files in `supabase/migrations/`
- ✅ Apply any that haven't been run yet
- ✅ Skip ones already applied

### Step 3: Verify

Check your Supabase dashboard to see if tables exist:
- https://app.supabase.com/project/jpvykalpweurxdgcvahi/editor

---

## 📝 Daily Workflow

### Creating New Migrations

**Option A: Manual (What you've been doing)**
```bash
# 1. Create new migration file
echo "ALTER TABLE..." > supabase/migrations/004_new_feature.sql

# 2. Edit the file with your SQL

# 3. Push to Supabase
npx supabase db push

# 4. Commit to Git
git add supabase/migrations/004_new_feature.sql
git commit -m "feat: add new feature"
git push
```

**Option B: CLI Generated**
```bash
# Create migration with auto-timestamp
npx supabase migration new add_new_feature

# This creates: supabase/migrations/20240630120000_add_new_feature.sql
# Edit the file, then push:
npx supabase db push
```

---

## 🔄 Full Command Reference

```bash
# Link project (one time setup)
npx supabase link --project-ref jpvykalpweurxdgcvahi

# Push migrations to database
npx supabase db push

# Create new migration
npx supabase migration new migration_name

# Check migration status
npx supabase migration list

# Pull database schema to local file
npx supabase db pull

# Reset database (DANGEROUS!)
npx supabase db reset
```

---

## 🤖 Automate with GitHub Actions (Optional)

Create `.github/workflows/deploy-migrations.yml`:

```yaml
name: Deploy Migrations

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/migrations/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1

      - name: Link Supabase
        run: npx supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Push Migrations
        run: npx supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

Add these secrets to GitHub:
- `SUPABASE_PROJECT_REF`: `jpvykalpweurxdgcvahi`
- `SUPABASE_ACCESS_TOKEN`: From Settings → API → Service Role Key

---

## ✅ Current Status

**What you have:**
- ✅ Migrations 001 & 002 applied manually
- ✅ Migration 003 created and pushed to GitHub
- ❌ GitHub UI integration not available

**What to do:**
1. Link project with CLI: `npx supabase link`
2. Push migrations: `npx supabase db push`
3. Future migrations: Same workflow

---

## 🎯 Why CLI is Better Anyway

**Advantages:**
- ✅ Works on all Supabase plans
- ✅ More control and features
- ✅ Can test locally with `supabase start`
- ✅ Better for teams and CI/CD
- ✅ Doesn't depend on UI features

**Disadvantages:**
- Requires command line
- Need to remember to run `db push`

---

## 💡 Tip: Add NPM Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "db:push": "npx supabase db push",
    "db:new-migration": "npx supabase migration new",
    "db:status": "npx supabase migration list"
  }
}
```

Then you can use:
```bash
npm run db:push           # Push migrations
npm run db:new-migration  # Create new migration
npm run db:status         # Check status
```

---

## 📋 Quick Checklist

- [ ] Run `npx supabase link --project-ref jpvykalpweurxdgcvahi`
- [ ] Enter database password or access token
- [ ] Run `npx supabase db push`
- [ ] Verify migration 003 applied
- [ ] Add npm scripts for convenience
- [ ] (Optional) Set up GitHub Actions

---

**Need Help?**
- Get DB password: Settings → Database → Connection String
- Get Access Token: Settings → API → Service Role Key
- Supabase CLI Docs: https://supabase.com/docs/guides/cli
