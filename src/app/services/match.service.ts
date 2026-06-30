import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Match, CreateMatchDto, UpdateMatchDto } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  constructor(
    private supabase: SupabaseService,
    private authService: AuthService
  ) {}

  async getMatchesForLeague(leagueId: string): Promise<{ data: Match[] | null; error: any }> {
    const { data, error } = await this.supabase.from('matches')
      .select('*')
      .eq('league_id', leagueId)
      .order('kickoff_time', { ascending: true });

    return { data, error };
  }

  async getMatchById(matchId: string): Promise<{ data: Match | null; error: any }> {
    const { data, error } = await this.supabase.from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    return { data, error };
  }

  async createMatch(dto: CreateMatchDto): Promise<{ data: Match | null; error: any }> {
    const { data, error } = await this.supabase.from('matches')
      .insert([dto])
      .select()
      .single();

    return { data, error };
  }

  async updateMatch(matchId: string, dto: UpdateMatchDto): Promise<{ data: Match | null; error: any }> {
    const { data, error } = await this.supabase.from('matches')
      .update(dto)
      .eq('id', matchId)
      .select()
      .single();

    return { data, error };
  }

  async deleteMatch(matchId: string): Promise<{ error: any }> {
    const { error } = await this.supabase.from('matches')
      .delete()
      .eq('id', matchId);

    return { error };
  }

  isKickoffPassed(match: Match): boolean {
    return new Date(match.kickoff_time) < new Date();
  }

  canEditPrediction(match: Match): boolean {
    return !this.isKickoffPassed(match);
  }
}
