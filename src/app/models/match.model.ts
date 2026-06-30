export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface Match {
  id: string;
  league_id: string;
  competition_id: string | null;
  home_team: string;
  away_team: string;
  kickoff_time: string;
  status: MatchStatus;
  actual_home_score: number | null;
  actual_away_score: number | null;
  created_at: string;
}

export interface CreateMatchDto {
  league_id: string;
  competition_id?: string;
  home_team: string;
  away_team: string;
  kickoff_time: string;
}

export interface UpdateMatchDto {
  home_team?: string;
  away_team?: string;
  kickoff_time?: string;
  status?: MatchStatus;
  actual_home_score?: number | null;
  actual_away_score?: number | null;
}
