export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
}

export interface CreateProfileDto {
  id: string;
  display_name?: string;
}
