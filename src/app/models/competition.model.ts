export interface Competition {
  id: string;
  name: string;
  description: string | null;
  season: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface CreateCompetitionDto {
  name: string;
  description?: string;
  season?: string;
  start_date?: string;
  end_date?: string;
}
