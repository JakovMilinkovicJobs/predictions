import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LeagueService } from '../../services/league.service';
import { LeaderboardService } from '../../services/leaderboard.service';
import { League } from '../../models/league.model';

interface LeagueWithStats extends League {
  competition_name?: string;
  member_count?: number;
  user_rank?: number;
  user_points?: number;
}

@Component({
  selector: 'app-leagues',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './leagues.component.html',
  styleUrl: './leagues.component.scss'
})
export class LeaguesComponent implements OnInit {
  leagues: LeagueWithStats[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private leagueService: LeagueService,
    private leaderboardService: LeaderboardService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadLeagues();
  }

  async loadLeagues(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    const { data, error } = await this.leagueService.getMyLeagues();

    if (error) {
      this.errorMessage = 'Failed to load leagues';
      console.error(error);
      this.loading = false;
      return;
    }

    if (data) {
      // Load additional stats for each league
      this.leagues = await Promise.all(
        data.map(async (league) => {
          const leagueWithStats: LeagueWithStats = { ...league };

          // Get member count
          const { data: members } = await this.leagueService.getLeagueMembers(league.id);
          leagueWithStats.member_count = members?.length || 0;

          // Get user rank and points
          const { data: leaderboard } = await this.leaderboardService.getLeaderboard(league.id);
          if (leaderboard) {
            const userEntry = leaderboard.find((entry: any) => entry.is_current_user);
            leagueWithStats.user_rank = userEntry?.rank;
            leagueWithStats.user_points = userEntry?.total_points;
          }

          return leagueWithStats;
        })
      );
    }

    this.loading = false;
  }

  navigateToLeague(leagueId: string): void {
    this.router.navigate(['/league', leagueId]);
  }

  navigateToCreateLeague(): void {
    this.router.navigate(['/create-league']);
  }

  navigateToJoinLeague(): void {
    this.router.navigate(['/join-league']);
  }
}
