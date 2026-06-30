import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LeagueService } from '../../services/league.service';
import { MatchService } from '../../services/match.service';
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
  isOwner = false;
  activeTab: 'matches' | 'leaderboard' | 'members' | 'admin' = 'matches';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leagueService: LeagueService,
    private matchService: MatchService
  ) {}

  async ngOnInit(): Promise<void> {
    this.leagueId = this.route.snapshot.paramMap.get('id')!;
    await this.loadLeagueData();
  }

  async loadLeagueData(): Promise<void> {
    this.loading = true;

    const { data: league } = await this.leagueService.getLeagueById(this.leagueId);
    this.league = league;

    this.isOwner = await this.leagueService.isLeagueOwner(this.leagueId);

    const { data: members } = await this.leagueService.getLeagueMembers(this.leagueId);
    this.members = members || [];

    const { data: matches } = await this.matchService.getMatchesForLeague(this.leagueId);
    this.matches = matches || [];

    this.loading = false;
  }

  setActiveTab(tab: 'matches' | 'leaderboard' | 'members' | 'admin'): void {
    this.activeTab = tab;
  }

  navigateToMatch(matchId: string): void {
    this.router.navigate(['/league', this.leagueId, 'match', matchId]);
  }

  navigateToLeaderboard(): void {
    this.router.navigate(['/league', this.leagueId, 'leaderboard']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/league', this.leagueId, 'admin']);
  }

  getUpcomingMatches(): Match[] {
    const now = new Date();
    return this.matches
      .filter(m => new Date(m.kickoff_time) > now)
      .sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime());
  }

  getFinishedMatches(): Match[] {
    return this.matches
      .filter(m => m.status === 'finished')
      .sort((a, b) => new Date(b.kickoff_time).getTime() - new Date(a.kickoff_time).getTime());
  }
}
