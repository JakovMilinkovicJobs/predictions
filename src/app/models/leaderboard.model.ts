export interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  total_points: number;
  exact_scores_count: number;
  correct_outcomes_count: number;
  predictions_count: number;
}

export interface LeaderboardStats {
  total_matches: number;
  finished_matches: number;
  upcoming_matches: number;
  total_participants: number;
}
