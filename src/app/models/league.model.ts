export interface League {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  owner_id: string;
  competition_id: string | null;
  points_exact_score: number;
  points_outcome: number;
  max_participants: number;
  created_at: string;
}

export interface CreateLeagueDto {
  name: string;
  description?: string;
  competition_id: string;
  points_exact_score: number;
  points_outcome: number;
  max_participants: number;
}

export interface LeagueMember {
  id: string;
  league_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export interface LeagueMemberWithProfile extends LeagueMember {
  profile?: {
    display_name: string | null;
  };
}

export interface JoinLeagueDto {
  invite_code: string;
}
