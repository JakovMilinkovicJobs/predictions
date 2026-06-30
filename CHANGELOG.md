# Changelog

## [Unreleased] - 2024-06-30

### Added
- Database schema with competitions and league scoring rules
- Competition service for managing soccer tournaments
- Updated league service with max participants validation
- Updated scoring service to use league-specific point rules
- Comprehensive documentation (setup, testing, GitHub integration)
- Updated leagues dashboard to show competition info, participant count, and user rank
- Mobile-first responsive design structure

### Changed
- Updated create-league page with competition selection and scoring configuration
- Updated environment files for new Supabase project
- Renamed git branch from master to main for Supabase compatibility
- Rewrote leagues component to work with Supabase backend

### Fixed
- SQL migration ordering issue (league_members reference)
- Environment files properly ignored in git

### Database
- Added `competitions` table with sample data
- Added `points_exact_score`, `points_outcome`, `max_participants` to `leagues` table
- Added `competition_id` to `leagues` and `matches` tables
- Created indexes for better performance

## Summary

This update prepares the app for full production use with:
- ✅ Proper database structure
- ✅ GitHub + Supabase integration
- ✅ Updated UI components
- ✅ Comprehensive documentation

### Next Steps
- Build league detail page with 3 tabs
- Create shared components (match-card, prediction-form)
- Implement match management
- Add mobile-first CSS styling
