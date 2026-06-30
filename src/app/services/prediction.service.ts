import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Prediction, CreatePredictionDto, UpdatePredictionDto } from '../models/prediction.model';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  constructor(
    private supabase: SupabaseService,
    private authService: AuthService
  ) {}

  async getPredictionForMatch(matchId: string): Promise<{ data: Prediction | null; error: any }> {
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data, error } = await this.supabase.from('predictions')
      .select('*')
      .eq('match_id', matchId)
      .eq('user_id', userId)
      .maybeSingle();

    return { data, error };
  }

  async getPredictionsForLeague(leagueId: string): Promise<{ data: Prediction[] | null; error: any }> {
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data, error } = await this.supabase.from('predictions')
      .select('*')
      .eq('league_id', leagueId)
      .eq('user_id', userId);

    return { data, error };
  }

  async getAllPredictionsForMatch(matchId: string): Promise<{ data: Prediction[] | null; error: any }> {
    const { data, error } = await this.supabase.from('predictions')
      .select('*')
      .eq('match_id', matchId);

    return { data, error };
  }

  async getAllPredictionsForLeague(leagueId: string): Promise<{ data: Prediction[] | null; error: any }> {
    const { data, error } = await this.supabase.from('predictions')
      .select('*')
      .eq('league_id', leagueId);

    return { data, error };
  }

  async createPrediction(dto: CreatePredictionDto): Promise<{ data: Prediction | null; error: any }> {
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data, error } = await this.supabase.from('predictions')
      .insert([{
        ...dto,
        user_id: userId
      }])
      .select()
      .single();

    return { data, error };
  }

  async updatePrediction(predictionId: string, dto: UpdatePredictionDto): Promise<{ data: Prediction | null; error: any }> {
    const { data, error } = await this.supabase.from('predictions')
      .update(dto)
      .eq('id', predictionId)
      .select()
      .single();

    return { data, error };
  }

  async upsertPrediction(dto: CreatePredictionDto): Promise<{ data: Prediction | null; error: any }> {
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data, error } = await this.supabase.from('predictions')
      .upsert({
        ...dto,
        user_id: userId
      }, {
        onConflict: 'match_id,user_id'
      })
      .select()
      .single();

    return { data, error };
  }
}
