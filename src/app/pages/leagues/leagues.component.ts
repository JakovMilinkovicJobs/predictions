import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  kickoff: Date;
  actualHomeScore?: number;
  actualAwayScore?: number;
  status: 'upcoming' | 'finished';
}

interface Prediction {
  matchId: string;
  userName: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedOutcome: '1' | 'X' | '2';
}

@Component({
  selector: 'app-leagues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leagues.component.html',
  styleUrl: './leagues.component.scss'
})
export class LeaguesComponent implements OnInit {
  userName = '';
  currentTab: 'matches' | 'leaderboard' = 'matches';
  matches: Match[] = [];
  predictions: { [matchId: string]: Prediction } = {};

  // Prediction form
  selectedMatch: Match | null = null;
  predictedHomeScore = 0;
  predictedAwayScore = 0;
  predictedOutcome: '1' | 'X' | '2' = '1';

  async ngOnInit(): Promise<void> {
    this.userName = localStorage.getItem('userName') || '';
    await this.loadMatchesFromAPI();
    await this.loadAllPredictions();

    // Refresh every 30 seconds
    setInterval(() => this.refreshData(), 30000);
  }

  async loadMatchesFromAPI(): Promise<void> {
    try {
      // Fetch from World Cup 2026 API
      const response = await fetch('https://worldcup26.ir/api/v1/matches');
      const data = await response.json();

      if (data && data.matches) {
        this.matches = data.matches.slice(0, 10).map((m: any) => ({
          id: m.id.toString(),
          homeTeam: m.home_team?.name || 'TBD',
          awayTeam: m.away_team?.name || 'TBD',
          kickoff: new Date(m.datetime),
          actualHomeScore: m.home_score,
          actualAwayScore: m.away_score,
          status: m.finished ? 'finished' : 'upcoming'
        }));
      }
    } catch (error) {
      console.error('Error loading matches:', error);
      // Fallback to hardcoded matches
      this.matches = [
        {
          id: '1',
          homeTeam: 'USA',
          awayTeam: 'Mexico',
          kickoff: new Date('2026-06-11T20:00:00'),
          status: 'upcoming'
        },
        {
          id: '2',
          homeTeam: 'Canada',
          awayTeam: 'Argentina',
          kickoff: new Date('2026-06-12T17:00:00'),
          status: 'upcoming'
        }
      ];
    }
  }

  async loadAllPredictions(): Promise<void> {
    try {
      const response = await fetch('/api');
      const data = await response.json();

      // Load my predictions
      if (data.predictions[this.userName]) {
        this.predictions = {};
        data.predictions[this.userName].forEach((p: Prediction) => {
          this.predictions[p.matchId] = p;
        });
      }

      // Store all predictions for leaderboard
      (window as any).allPredictions = data.predictions;
    } catch (error) {
      console.error('Error loading predictions:', error);
    }
  }

  async savePrediction(prediction: Prediction): Promise<void> {
    try {
      await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prediction)
      });
      await this.loadAllPredictions();
    } catch (error) {
      console.error('Error saving prediction:', error);
    }
  }

  async refreshData(): Promise<void> {
    await this.loadMatchesFromAPI();
    await this.loadAllPredictions();
  }

  openPredictionModal(match: Match): void {
    this.selectedMatch = match;
    const existing = this.predictions[match.id];
    if (existing) {
      this.predictedHomeScore = existing.predictedHomeScore;
      this.predictedAwayScore = existing.predictedAwayScore;
      this.predictedOutcome = existing.predictedOutcome;
    } else {
      this.predictedHomeScore = 0;
      this.predictedAwayScore = 0;
      this.predictedOutcome = '1';
    }
  }

  closePredictionModal(): void {
    this.selectedMatch = null;
  }

  async submitPrediction(): Promise<void> {
    if (!this.selectedMatch) return;

    const prediction: Prediction = {
      matchId: this.selectedMatch.id,
      userName: this.userName,
      predictedHomeScore: this.predictedHomeScore,
      predictedAwayScore: this.predictedAwayScore,
      predictedOutcome: this.predictedOutcome
    };

    this.predictions[this.selectedMatch.id] = prediction;
    await this.savePrediction(prediction);
    this.closePredictionModal();
  }

  hasPrediction(matchId: string): boolean {
    return !!this.predictions[matchId];
  }

  isKickoffPassed(match: Match): boolean {
    return new Date(match.kickoff) < new Date();
  }

  getAllUserNamesForMatch(matchId: string): string[] {
    const allPreds = (window as any).allPredictions || {};
    return Object.keys(allPreds).filter(userName =>
      allPreds[userName].some((p: Prediction) => p.matchId === matchId)
    );
  }

  getUserPrediction(userName: string, matchId: string): string {
    const allPreds = (window as any).allPredictions || {};
    const userPreds = allPreds[userName] || [];
    const pred = userPreds.find((p: Prediction) => p.matchId === matchId);
    if (!pred) return '-';
    return `${pred.predictedHomeScore}-${pred.predictedAwayScore} (${pred.predictedOutcome})`;
  }

  calculatePoints(userName: string, match: Match): number {
    if (match.actualHomeScore === undefined || match.actualAwayScore === undefined) {
      return 0;
    }

    const allPreds = (window as any).allPredictions || {};
    const userPreds = allPreds[userName] || [];
    const pred = userPreds.find((p: Prediction) => p.matchId === match.id);
    if (!pred) return 0;

    let points = 0;

    // Exact score: +3 points
    if (pred.predictedHomeScore === match.actualHomeScore &&
        pred.predictedAwayScore === match.actualAwayScore) {
      points += 3;
    }

    // Correct outcome: +1 point
    const actualOutcome = this.getActualOutcome(match);
    if (pred.predictedOutcome === actualOutcome) {
      points += 1;
    }

    return points;
  }

  getActualOutcome(match: Match): '1' | 'X' | '2' {
    if (match.actualHomeScore === undefined || match.actualAwayScore === undefined) {
      return 'X';
    }
    if (match.actualHomeScore > match.actualAwayScore) return '1';
    if (match.actualHomeScore < match.actualAwayScore) return '2';
    return 'X';
  }

  getLeaderboard(): any[] {
    const allPreds = (window as any).allPredictions || {};
    const leaderboard: { [userName: string]: number } = {};

    // Calculate total points for each user
    Object.keys(allPreds).forEach(userName => {
      let totalPoints = 0;
      this.matches.forEach(match => {
        totalPoints += this.calculatePoints(userName, match);
      });
      leaderboard[userName] = totalPoints;
    });

    // Convert to array and sort
    return Object.entries(leaderboard)
      .map(([userName, points]) => ({ userName, points }))
      .sort((a, b) => b.points - a.points);
  }
}
