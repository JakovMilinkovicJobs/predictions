import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { League, LeagueMember, LeagueMemberWithProfile, CreateLeagueDto, JoinLeagueDto } from '../models/league.model';

@Injectable({
  providedIn: 'root'
})
export class LeagueService {
  constructor(
    private supabase: SupabaseService,
    private authService: AuthService
  ) {}

  async createLeague(dto: CreateLeagueDto): Promise<{ data: League | null; error: any }> {
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // Generate a random invite code
    const inviteCode = this.generateInviteCode();

    const { data, error } = await this.supabase.from('leagues').insert([{
      name: dto.name,
      description: dto.description || null,
      invite_code: inviteCode,
      owner_id: userId,
      competition_id: dto.competition_id,
      points_exact_score: dto.points_exact_score,
      points_outcome: dto.points_outcome,
      max_participants: dto.max_participants
    }]).select().single();

    if (error) {
      return { data: null, error };
    }

    // Add creator as a member
    await this.supabase.from('league_members').insert([{
      league_id: data.id,
      user_id: userId,
      role: 'owner'
    }]);

    return { data, error: null };
  }

  async getMyLeagues(): Promise<{ data: League[] | null; error: any }> {
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data, error } = await this.supabase.from('league_members')
      .select('league_id, leagues(*)')
      .eq('user_id', userId);

    if (error) {
      return { data: null, error };
    }

    const leagues = data.map((item: any) => item.leagues);
    return { data: leagues, error: null };
  }

  async getLeagueById(leagueId: string): Promise<{ data: League | null; error: any }> {
    const { data, error } = await this.supabase.from('leagues')
      .select('*')
      .eq('id', leagueId)
      .single();

    return { data, error };
  }

  async joinLeague(dto: JoinLeagueDto): Promise<{ data: League | null; error: any }> {
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // Find league by invite code
    const { data: league, error: leagueError } = await this.supabase.from('leagues')
      .select('*')
      .eq('invite_code', dto.invite_code.toUpperCase())
      .single();

    if (leagueError || !league) {
      return { data: null, error: { message: 'Invalid invite code' } };
    }

    // Check if already a member
    const { data: existingMember } = await this.supabase.from('league_members')
      .select('*')
      .eq('league_id', league.id)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return { data: league, error: null };
    }

    // Check if league is full
    const { count, error: countError } = await this.supabase.from('league_members')
      .select('*', { count: 'exact', head: true })
      .eq('league_id', league.id);

    if (countError) {
      return { data: null, error: countError };
    }

    if (count !== null && league.max_participants && count >= league.max_participants) {
      return { data: null, error: { message: 'League is full' } };
    }

    // Join league
    const { error: joinError } = await this.supabase.from('league_members').insert([{
      league_id: league.id,
      user_id: userId,
      role: 'member'
    }]);

    if (joinError) {
      return { data: null, error: joinError };
    }

    return { data: league, error: null };
  }

  async getLeagueMembers(leagueId: string): Promise<{ data: LeagueMemberWithProfile[] | null; error: any }> {
    const { data, error } = await this.supabase.from('league_members')
      .select(`
        *,
        profiles:user_id (
          display_name
        )
      `)
      .eq('league_id', leagueId);

    if (error) {
      return { data: null, error };
    }

    const members: LeagueMemberWithProfile[] = data.map((item: any) => ({
      ...item,
      profile: item.profiles
    }));

    return { data: members, error: null };
  }

  async removeMember(leagueId: string, userId: string): Promise<{ error: any }> {
    const { error } = await this.supabase.from('league_members')
      .delete()
      .eq('league_id', leagueId)
      .eq('user_id', userId);

    return { error };
  }

  async isLeagueOwner(leagueId: string): Promise<boolean> {
    const userId = this.authService.currentUser?.id;
    if (!userId) return false;

    const { data } = await this.supabase.from('leagues')
      .select('owner_id')
      .eq('id', leagueId)
      .single();

    return data?.owner_id === userId;
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
