// Outcome must be stored separately from score prediction
// "1" = home team wins
// "X" = draw
// "2" = away team wins
export type PredictedOutcome = '1' | 'X' | '2';

export interface Prediction {
  id: string;
  league_id: string;
  match_id: string;
  user_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_outcome: PredictedOutcome;
  created_at: string;
  updated_at: string;
}

export interface CreatePredictionDto {
  league_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_outcome: PredictedOutcome;
}

export interface UpdatePredictionDto {
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_outcome: PredictedOutcome;
}

export interface PredictionWithPoints extends Prediction {
  points: number;
  exact_score_correct: boolean;
  outcome_correct: boolean;
}
