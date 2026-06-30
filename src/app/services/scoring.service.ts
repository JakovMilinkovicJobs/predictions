import { Injectable } from '@angular/core';
import { Match } from '../models/match.model';
import { Prediction, PredictedOutcome } from '../models/prediction.model';
import { League } from '../models/league.model';

@Injectable({
  providedIn: 'root'
})
export class ScoringService {
  /**
   * Calculate points for a prediction based on actual match result and league scoring rules
   * Scoring rules are defined per league:
   * - Exact score correct: league.points_exact_score points
   * - Outcome correct: league.points_outcome points
   * - Both are calculated independently
   */
  calculatePredictionPoints(prediction: Prediction, match: Match, league: League): number {
    if (match.actual_home_score === null || match.actual_away_score === null) {
      return 0;
    }

    let points = 0;

    // Check exact score
    if (
      prediction.predicted_home_score === match.actual_home_score &&
      prediction.predicted_away_score === match.actual_away_score
    ) {
      points += league.points_exact_score;
    }

    // Check outcome - calculated independently from score
    const actualOutcome = this.getActualOutcome(match);
    if (prediction.predicted_outcome === actualOutcome) {
      points += league.points_outcome;
    }

    return points;
  }

  /**
   * Get the actual outcome of a finished match
   * "1" = home team wins
   * "X" = draw
   * "2" = away team wins
   */
  getActualOutcome(match: Match): PredictedOutcome | null {
    if (match.actual_home_score === null || match.actual_away_score === null) {
      return null;
    }

    if (match.actual_home_score > match.actual_away_score) {
      return '1';
    } else if (match.actual_home_score < match.actual_away_score) {
      return '2';
    } else {
      return 'X';
    }
  }

  /**
   * Check if exact score prediction was correct
   */
  isExactScoreCorrect(prediction: Prediction, match: Match): boolean {
    if (match.actual_home_score === null || match.actual_away_score === null) {
      return false;
    }

    return (
      prediction.predicted_home_score === match.actual_home_score &&
      prediction.predicted_away_score === match.actual_away_score
    );
  }

  /**
   * Check if outcome prediction was correct
   */
  isOutcomeCorrect(prediction: Prediction, match: Match): boolean {
    const actualOutcome = this.getActualOutcome(match);
    if (!actualOutcome) {
      return false;
    }

    return prediction.predicted_outcome === actualOutcome;
  }
}
