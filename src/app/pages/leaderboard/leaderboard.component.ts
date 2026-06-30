import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LeaderboardService } from '../../services/leaderboard.service';
import { LeaderboardEntry, LeaderboardStats } from '../../models/leaderboard.model';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent implements OnInit {
  leagueId!: string;
  leaderboard: LeaderboardEntry[] = [];
  stats: LeaderboardStats | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private leaderboardService: LeaderboardService
  ) {}

  async ngOnInit(): Promise<void> {
    this.leagueId = this.route.snapshot.paramMap.get('leagueId')!;
    await this.loadLeaderboard();
  }

  async loadLeaderboard(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    const [leaderboardResult, statsResult] = await Promise.all([
      this.leaderboardService.calculateLeaderboard(this.leagueId),
      this.leaderboardService.getLeagueStats(this.leagueId)
    ]);

    this.loading = false;

    if (leaderboardResult.error) {
      this.errorMessage = 'Failed to load leaderboard';
      console.error('Error loading leaderboard:', leaderboardResult.error);
      return;
    }

    this.leaderboard = leaderboardResult.data || [];
    this.stats = statsResult.data;
  }

  getRankSuffix(rank: number): string {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  }
}
