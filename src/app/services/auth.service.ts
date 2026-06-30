import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Profile, CreateProfileDto } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {
    // Initialize - auto sign in anonymously if no session exists
    this.initializeAuth();

    // Listen for auth state changes
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      this.currentUserSubject.next(session?.user ?? null);

      // Auto-create profile for new anonymous users
      if (event === 'SIGNED_IN' && session?.user) {
        await this.ensureProfileExists(session.user);
      }
    });
  }

  private async initializeAuth(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();

    if (data.session) {
      // User already has a session
      this.currentUserSubject.next(data.session.user);
    } else {
      // No session - sign in anonymously
      await this.signInAnonymously();
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  async signUp(email: string, password: string, displayName?: string): Promise<{ error: any }> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        return { error };
      }

      // Create profile for the new user
      if (data.user) {
        const profileDto: CreateProfileDto = {
          id: data.user.id,
          display_name: displayName
        };

        const { error: profileError } = await this.supabase.from('profiles').insert([profileDto]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async signIn(email: string, password: string): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!error) {
        await this.router.navigate(['/leagues']);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    await this.router.navigate(['/login']);
  }

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase.from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  async updateProfile(userId: string, displayName: string): Promise<{ error: any }> {
    const { error } = await this.supabase.from('profiles')
      .update({ display_name: displayName })
      .eq('id', userId);

    return { error };
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/leagues`
        }
      });

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Sign in with GitHub OAuth (easier alternative to Google)
   */
  async signInWithGitHub(): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/leagues`
        }
      });

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Sign in with Magic Link (passwordless email login)
   * User receives email with login link - NO PASSWORD NEEDED!
   */
  async signInAnonymously(): Promise<{ error: any }> {
    try {
      const { data, error } = await this.supabase.auth.signInAnonymously();

      if (!error && data.user) {
        this.currentUserSubject.next(data.user);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Ensure profile exists for user (auto-create for anonymous users)
   */
  private async ensureProfileExists(user: User): Promise<void> {
    // Check if profile already exists
    const { data: existingProfile } = await this.supabase.from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      return; // Profile already exists
    }

    // For anonymous users, generate a random display name
    const randomNum = Math.floor(Math.random() * 10000);
    const displayName = `Player${randomNum}`;

    const profileDto: CreateProfileDto = {
      id: user.id,
      display_name: displayName
    };

    const { error: profileError } = await this.supabase.from('profiles')
      .insert([profileDto]);

    if (profileError) {
      console.error('Error creating profile for anonymous user:', profileError);
    }
  }

  /**
   * Update user's display name
   */
  async updateDisplayName(displayName: string): Promise<{ error: any }> {
    if (!this.currentUser) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await this.supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', this.currentUser.id);

    return { error };
  }
}
