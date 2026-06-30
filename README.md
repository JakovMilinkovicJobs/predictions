# World Cup Prediction League

A mobile-first web app for running friendly World Cup prediction leagues with friends. Built with Angular and Supabase.

**This is NOT a real-money betting app** - it's a friendly prediction game for fun!

## Features

- 🔐 **Multiple login options**:
  - ✉️ **Magic Link** - Easiest! Just enter email, no password needed (requires NO setup!)
  - 🔑 **GitHub Sign-In** - Quick OAuth login (simple setup)
  - 🌐 **Google Sign-In** - OAuth login (requires Google Cloud setup)
  - 🔒 Traditional email + password
- 🏆 Create and join prediction leagues with invite codes
- ⚽ Predict match scores AND outcomes independently
- 📊 Real-time leaderboard with points tracking
- 👥 League member management
- 📱 Mobile-first responsive design
- 🔒 Predictions hidden until kickoff - see everyone's predictions only after the match starts
- 👀 View all league members' predictions and scores after kickoff
- 🎯 Unique scoring system:
  - +3 points for exact score prediction
  - +1 point for correct outcome prediction
  - Score and outcome predictions are independent

## Prediction Rules

For each match, you make TWO separate predictions:

1. **Exact Score**: Predict the exact result (e.g., 2-1)
2. **Outcome**: Predict who wins or if it's a draw
   - "1" = Home team wins
   - "X" = Draw
   - "2" = Away team wins

**Important**: Your outcome prediction can contradict your score prediction! For example, you can predict a score of 2-1 but also predict outcome "X" (draw). Both are scored independently.

## Tech Stack

- **Frontend**: Angular 19 with TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: SCSS with mobile-first approach
- **Architecture**: Clean separation with services, models, guards, and reusable components

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Run the migration script located at: `supabase/migrations/001_initial_schema.sql`
4. Copy your Supabase URL and anon key from Project Settings > API
5. **Enable Authentication Providers** (optional):
   - **Magic Link**: ✅ Enabled by default - NO setup needed!
   - **GitHub OAuth** (recommended - easiest OAuth option):
     - Go to Authentication > Providers
     - Find "GitHub" and toggle it ON
     - Follow Supabase's simple GitHub OAuth setup guide
   - **Google OAuth** (more complex setup):
     - Go to Authentication > Providers
     - Find "Google" and toggle it ON
     - Requires creating OAuth credentials in Google Cloud Console
     - See [Google Cloud OAuth Setup Guide](https://cloud.google.com/docs/authentication)

### 3. Configure Environment

Edit `src/environments/environment.ts` and `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: false, // true for prod
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  }
};
```

### 4. Run the App

```bash
npm start
```

Navigate to `http://localhost:4200/`

## Project Structure

```
src/app/
├── models/              # TypeScript interfaces
├── services/            # Business logic and Supabase calls
├── guards/              # Route guards (auth)
├── pages/               # Page components
│   ├── login/
│   ├── register/
│   ├── leagues/
│   ├── create-league/
│   ├── join-league/
│   ├── league-detail/
│   ├── match-prediction/
│   ├── leaderboard/
│   └── admin-matches/
└── app.routes.ts        # Route configuration
```

## How to Use

1. **Register** a new account
2. **Create a league** or **join** one with an invite code
3. **League owner** can create matches manually
4. **Members** predict scores and outcomes before kickoff
5. **Before kickoff**, predictions are private - you can't see others' predictions
6. **After kickoff**, predictions are locked and become visible to all league members
7. **View all predictions** - click "Show All Predictions" to see what everyone predicted
8. **League owner** updates match results when finished
9. **View leaderboard** to see rankings, total points, and who earned what for each match

## Scoring Examples

Match result: 2-1

| Your Prediction | Your Outcome | Points | Explanation |
|-----------------|--------------|--------|-------------|
| 2-1 | "1" | 4 | Exact score (3) + correct outcome (1) |
| 2-1 | "X" | 3 | Exact score (3) only |
| 3-0 | "1" | 1 | Correct outcome (1) only |
| 1-1 | "X" | 0 | Both wrong (actual outcome is "1") |

## Future TODOs

The following features are marked for future development:

- Import World Cup matches automatically from external API
- Push notifications before prediction deadlines
- Enhanced admin panel with bulk operations
- Audit log for result changes
- Move leaderboard calculation to database functions for better performance
- Stronger anti-cheat mechanisms
- Production-ready RLS policies with stricter controls
- Add private/public league visibility options
- Match statistics and historical trends

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for the complete schema including:

- `profiles` - User profiles
- `leagues` - Prediction leagues
- `league_members` - League membership
- `matches` - Match fixtures
- `predictions` - User predictions

## License

This is a personal project for educational and entertainment purposes.

## Contributing

This is a personal project, but suggestions and feedback are welcome via issues.
