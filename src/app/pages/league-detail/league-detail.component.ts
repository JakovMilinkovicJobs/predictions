import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LeagueService } from '../../services/league.service';
import { MatchService } from '../../services/match.service';
import { LeaderboardService } from '../../services/leaderboard.service';
import { League, LeagueMemberWithProfile } from '../../models/league.model';
import { Match } from '../../models/match.model';

@Component({
  selector: 'app-league-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './league-detail.component.html',
  styleUrl: './league-detail.component.scss'
})
export class LeagueDetailComponent implements OnInit {
  leagueId!: string;
  league: League | null = null;
  members: LeagueMemberWithProfile[] = [];
  matches: Match[] = [];
  leaderboard: any[] = [];
  isOwner = false;

  // Tab system: scoreboard | future-matches | previous-matches
  activeTab: 'scoreboard' | 'future-matches' | 'previous-matches' = 'future-matches';

  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leagueService: LeagueService,
    private matchService: MatchService,
    private leaderboardService: LeaderboardService
  ) {}

  async ngOnInit(): Promise<void> {
    this.leagueId = this.route.snapshot.paramMap.get('id')!;
    if (!this.leagueId) {
      this.router.navigate(['/leagues']);
      return;
    }
    await this.loadLeagueData();
  }

  async loadLeagueData(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      // Load league details
      const { data: league, error: leagueError } = await this.leagueService.getLeagueById(this.leagueId);
      if (leagueError) throw leagueError;
      this.league = league;

      // Check if user is owner
      this.isOwner = await this.leagueService.isLeagueOwner(this.leagueId);

      // Load members
      const { data: members, error: membersError } = await this.leagueService.getLeagueMembers(this.leagueId);
      if (membersError) throw membersError;
      this.members = members || [];

      // Load matches
      const { data: matches, error: matchesError } = await this.matchService.getMatchesForLeague(this.leagueId);
      if (matchesError) throw matchesError;
      this.matches = matches || [];

      // Load leaderboard
      const { data: leaderboard, error: leaderboardError } = await this.leaderboardService.getLeaderboard(this.leagueId);
      if (leaderboardError) throw leaderboardError;
      this.leaderboard = leaderboard || [];

    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to load league data';
      console.error('Error loading league:', error);
    }

    this.loading = false;
  }

  setActiveTab(tab: 'scoreboard' | 'future-matches' | 'previous-matches'): void {
    this.activeTab = tab;
  }

  // Get future matches (kickoff time hasn't passed)
  getFutureMatches(): Match[] {
    const now = new Date();
    return this.matches
      .filter(m => new Date(m.kickoff_time) > now)
      .sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime());
  }

  // Get previous matches (kickoff time has passed or status is finished)
  getPreviousMatches(): Match[] {
    const now = new Date();
    return this.matches
      .filter(m => new Date(m.kickoff_time) <= now || m.status === 'finished')
      .sort((a, b) => new Date(b.kickoff_time).getTime() - new Date(a.kickoff_time).getTime());
  }

  // Navigate to match prediction page
  navigateToMatchPrediction(matchId: string): void {
    this.router.navigate(['/league', this.leagueId, 'match', matchId]);
  }

  // Navigate to match detail/results page
  navigateToMatchDetail(matchId: string): void {
    this.router.navigate(['/league', this.leagueId, 'match', matchId, 'detail']);
  }

  // Navigate to admin page (for league owners)
  navigateToAdmin(): void {
    if (this.isOwner) {
      this.router.navigate(['/league', this.leagueId, 'admin']);
    }
  }

  // Share invite code
  shareInviteCode(): void {
    if (this.league?.invite_code) {
      navigator.clipboard.writeText(this.league.invite_code);
      alert('Invite code copied to clipboard!');
    }
  }

  // Check if match kickoff has passed
  isKickoffPassed(match: Match): boolean {
    return new Date(match.kickoff_time) <= new Date();
  }

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
