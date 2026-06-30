import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ScoringService } from './scoring.service';
import { PredictionService } from './prediction.service';
import { MatchService } from './match.service';
import { LeagueService } from './league.service';
import { LeaderboardEntry, LeaderboardStats } from '../models/leaderboard.model';
import { Match } from '../models/match.model';
import { Prediction } from '../models/prediction.model';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  constructor(
    private supabase: SupabaseService,
    private scoringService: ScoringService,
    private predictionService: PredictionService,
    private matchService: MatchService,
    private leagueService: LeagueService
  ) {}

  /**
   * Calculate leaderboard for a league
   * TODO: Move this calculation to database function for better performance
   */
  async calculateLeaderboard(leagueId: string): Promise<{ data: LeaderboardEntry[] | null; error: any }> {
    try {
      // Get all members
      const { data: members, error: membersError } = await this.leagueService.getLeagueMembers(leagueId);
      if (membersError || !members) {
        return { data: null, error: membersError };
      }

      // Get all matches for the league
      const { data: matches, error: matchesError } = await this.matchService.getMatchesForLeague(leagueId);
      if (matchesError || !matches) {
        return { data: null, error: matchesError };
      }

      // Get all predictions for the league
      const { data: allPredictions, error: predictionsError } = await this.predictionService.getAllPredictionsForLeague(leagueId);
      if (predictionsError) {
        return { data: null, error: predictionsError };
      }

      const predictions = allPredictions || [];
      const finishedMatches = matches.filter(m => m.status === 'finished');

      // Calculate points for each member
      const leaderboardEntries: LeaderboardEntry[] = members.map(member => {
        const userPredictions = predictions.filter(p => p.user_id === member.user_id);

        let totalPoints = 0;
        let exactScoresCount = 0;
        let correctOutcomesCount = 0;

        userPredictions.forEach(prediction => {
          const match = finishedMatches.find(m => m.id === prediction.match_id);
          if (match) {
            const points = this.scoringService.calculatePredictionPoints(prediction, match);
            totalPoints += points;

            if (this.scoringService.isExactScoreCorrect(prediction, match)) {
              exactScoresCount++;
            }

            if (this.scoringService.isOutcomeCorrect(prediction, match)) {
              correctOutcomesCount++;
            }
          }
        });

        return {
          user_id: member.user_id,
          display_name: member.profile?.display_name || null,
          total_points: totalPoints,
          exact_scores_count: exactScoresCount,
          correct_outcomes_count: correctOutcomesCount,
          predictions_count: userPredictions.length
        };
      });

      // Sort by total points descending
      leaderboardEntries.sort((a, b) => {
        if (b.total_points !== a.total_points) {
          return b.total_points - a.total_points;
        }
        // Tiebreaker: exact scores
        if (b.exact_scores_count !== a.exact_scores_count) {
          return b.exact_scores_count - a.exact_scores_count;
        }
        // Tiebreaker: correct outcomes
        return b.correct_outcomes_count - a.correct_outcomes_count;
      });

      return { data: leaderboardEntries, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get stats for the league
   */
  async getLeagueStats(leagueId: string): Promise<{ data: LeaderboardStats | null; error: any }> {
    try {
      const { data: matches, error: matchesError } = await this.matchService.getMatchesForLeague(leagueId);
      if (matchesError || !matches) {
        return { data: null, error: matchesError };
      }

      const { data: members, error: membersError } = await this.leagueService.getLeagueMembers(leagueId);
      if (membersError || !members) {
        return { data: null, error: membersError };
      }

      const now = new Date();
      const finishedMatches = matches.filter(m => m.status === 'finished');
      const upcomingMatches = matches.filter(m => new Date(m.kickoff_time) > now);

      const stats: LeaderboardStats = {
        total_matches: matches.length,
        finished_matches: finishedMatches.length,
        upcoming_matches: upcomingMatches.length,
        total_participants: members.length
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}
