import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { PredictionService } from '../../services/prediction.service';
import { ScoringService } from '../../services/scoring.service';
import { LeagueService } from '../../services/league.service';
import { AuthService } from '../../services/auth.service';
import { Match } from '../../models/match.model';
import { Prediction, PredictedOutcome } from '../../models/prediction.model';

interface PredictionWithUser extends Prediction {
  display_name: string | null;
  points?: number;
  isCurrentUser?: boolean;
}

@Component({
  selector: 'app-match-prediction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './match-prediction.component.html',
  styleUrl: './match-prediction.component.scss'
})
export class MatchPredictionComponent implements OnInit {
  leagueId!: string;
  matchId!: string;
  match: Match | null = null;
  existingPrediction: Prediction | null = null;
  predictionForm: FormGroup;
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';
  canEdit = false;
  earnedPoints: number | null = null;

  // For showing all predictions after kickoff
  allPredictions: PredictionWithUser[] = [];
  showAllPredictions = false;
  kickoffPassed = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private matchService: MatchService,
    private predictionService: PredictionService,
    private scoringService: ScoringService,
    private leagueService: LeagueService,
    private authService: AuthService
  ) {
    this.predictionForm = this.fb.group({
      predicted_home_score: [0, [Validators.required, Validators.min(0)]],
      predicted_away_score: [0, [Validators.required, Validators.min(0)]],
      predicted_outcome: ['1', [Validators.required]]
    });
  }

  async ngOnInit(): Promise<void> {
    this.leagueId = this.route.snapshot.paramMap.get('leagueId')!;
    this.matchId = this.route.snapshot.paramMap.get('matchId')!;
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading = true;

    const { data: match } = await this.matchService.getMatchById(this.matchId);
    this.match = match;

    if (this.match) {
      this.canEdit = this.matchService.canEditPrediction(this.match);
      this.kickoffPassed = this.matchService.isKickoffPassed(this.match);

      const { data: prediction } = await this.predictionService.getPredictionForMatch(this.matchId);
      this.existingPrediction = prediction;

      if (prediction) {
        this.predictionForm.patchValue({
          predicted_home_score: prediction.predicted_home_score,
          predicted_away_score: prediction.predicted_away_score,
          predicted_outcome: prediction.predicted_outcome
        });

        // Calculate points if match is finished
        if (this.match.status === 'finished') {
          this.earnedPoints = this.scoringService.calculatePredictionPoints(prediction, this.match);
        }
      }

      if (!this.canEdit) {
        this.predictionForm.disable();
      }

      // Load all predictions if kickoff has passed
      if (this.kickoffPassed) {
        await this.loadAllPredictions();
      }
    }

    this.loading = false;
  }

  async loadAllPredictions(): Promise<void> {
    if (!this.match) return;

    // Get all predictions for this match
    const { data: predictions } = await this.predictionService.getAllPredictionsForMatch(this.matchId);

    if (!predictions) {
      this.allPredictions = [];
      return;
    }

    // Get all league members to map user IDs to display names
    const { data: members } = await this.leagueService.getLeagueMembers(this.leagueId);

    if (!members) {
      this.allPredictions = [];
      return;
    }

    const currentUserId = this.authService.currentUser?.id;

    // Combine predictions with user info and calculate points
    this.allPredictions = predictions.map(pred => {
      const member = members.find(m => m.user_id === pred.user_id);
      const displayName = member?.profile?.display_name || 'Anonymous';

      let points: number | undefined;
      if (this.match?.status === 'finished') {
        points = this.scoringService.calculatePredictionPoints(pred, this.match);
      }

      return {
        ...pred,
        display_name: displayName,
        points,
        isCurrentUser: pred.user_id === currentUserId
      };
    });

    // Sort by points (if match is finished) or by name
    if (this.match?.status === 'finished') {
      this.allPredictions.sort((a, b) => (b.points || 0) - (a.points || 0));
    } else {
      this.allPredictions.sort((a, b) =>
        (a.display_name || '').localeCompare(b.display_name || '')
      );
    }
  }

  toggleShowAllPredictions(): void {
    this.showAllPredictions = !this.showAllPredictions;
  }

  getOutcomeLabel(outcome: PredictedOutcome): string {
    if (outcome === '1') return 'Home Win';
    if (outcome === 'X') return 'Draw';
    return 'Away Win';
  }

  selectOutcome(outcome: PredictedOutcome): void {
    this.predictionForm.patchValue({ predicted_outcome: outcome });
  }

  async onSubmit(): Promise<void> {
    if (this.predictionForm.invalid || !this.match || !this.canEdit) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.predictionForm.value;

    const { data, error } = await this.predictionService.upsertPrediction({
      league_id: this.leagueId,
      match_id: this.matchId,
      predicted_home_score: Number(formValue.predicted_home_score),
      predicted_away_score: Number(formValue.predicted_away_score),
      predicted_outcome: formValue.predicted_outcome
    });

    this.saving = false;

    if (error) {
      this.errorMessage = error.message || 'Failed to save prediction';
      return;
    }

    this.successMessage = 'Prediction saved successfully!';
    this.existingPrediction = data;

    setTimeout(() => {
      this.router.navigate(['/league', this.leagueId]);
    }, 1500);
  }

  isOutcomeSelected(outcome: PredictedOutcome): boolean {
    return this.predictionForm.get('predicted_outcome')?.value === outcome;
  }

  getActualOutcome(): PredictedOutcome | null {
    if (!this.match) return null;
    return this.scoringService.getActualOutcome(this.match);
  }

  isExactScoreCorrect(): boolean {
    if (!this.match || !this.existingPrediction || this.match.status !== 'finished') {
      return false;
    }
    return this.scoringService.isExactScoreCorrect(this.existingPrediction, this.match);
  }

  isOutcomeCorrect(): boolean {
    if (!this.match || !this.existingPrediction || this.match.status !== 'finished') {
      return false;
    }
    return this.scoringService.isOutcomeCorrect(this.existingPrediction, this.match);
  }
}
