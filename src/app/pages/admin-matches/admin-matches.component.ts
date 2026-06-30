import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { LeagueService } from '../../services/league.service';
import { Match } from '../../models/match.model';

@Component({
  selector: 'app-admin-matches',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-matches.component.html',
  styleUrl: './admin-matches.component.scss'
})
export class AdminMatchesComponent implements OnInit {
  leagueId!: string;
  matches: Match[] = [];
  isOwner = false;
  loading = true;
  showCreateForm = false;
  showEditForm = false;
  editingMatch: Match | null = null;

  createForm: FormGroup;
  editForm: FormGroup;

  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private matchService: MatchService,
    private leagueService: LeagueService
  ) {
    this.createForm = this.fb.group({
      home_team: ['', Validators.required],
      away_team: ['', Validators.required],
      kickoff_time: ['', Validators.required]
    });

    this.editForm = this.fb.group({
      home_team: ['', Validators.required],
      away_team: ['', Validators.required],
      kickoff_time: ['', Validators.required],
      status: ['scheduled', Validators.required],
      actual_home_score: [null],
      actual_away_score: [null]
    });
  }

  async ngOnInit(): Promise<void> {
    this.leagueId = this.route.snapshot.paramMap.get('leagueId')!;
    this.isOwner = await this.leagueService.isLeagueOwner(this.leagueId);

    if (!this.isOwner) {
      this.errorMessage = 'You do not have permission to manage matches';
      this.loading = false;
      return;
    }

    await this.loadMatches();
  }

  async loadMatches(): Promise<void> {
    this.loading = true;
    const { data, error } = await this.matchService.getMatchesForLeague(this.leagueId);
    this.loading = false;

    if (error) {
      this.errorMessage = 'Failed to load matches';
      return;
    }

    this.matches = data || [];
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.showEditForm = false;
    this.createForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  async onCreateSubmit(): Promise<void> {
    if (this.createForm.invalid) return;

    const formValue = this.createForm.value;
    const { data, error } = await this.matchService.createMatch({
      league_id: this.leagueId,
      home_team: formValue.home_team,
      away_team: formValue.away_team,
      kickoff_time: new Date(formValue.kickoff_time).toISOString()
    });

    if (error) {
      this.errorMessage = 'Failed to create match';
      return;
    }

    this.successMessage = 'Match created successfully!';
    this.createForm.reset();
    this.showCreateForm = false;
    await this.loadMatches();

    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  editMatch(match: Match): void {
    this.editingMatch = match;
    this.showEditForm = true;
    this.showCreateForm = false;
    this.errorMessage = '';
    this.successMessage = '';

    // Format datetime for input
    const kickoffDate = new Date(match.kickoff_time);
    const formattedDate = this.formatDateTimeForInput(kickoffDate);

    this.editForm.patchValue({
      home_team: match.home_team,
      away_team: match.away_team,
      kickoff_time: formattedDate,
      status: match.status,
      actual_home_score: match.actual_home_score,
      actual_away_score: match.actual_away_score
    });
  }

  async onEditSubmit(): Promise<void> {
    if (this.editForm.invalid || !this.editingMatch) return;

    const formValue = this.editForm.value;
    const { data, error } = await this.matchService.updateMatch(this.editingMatch.id, {
      home_team: formValue.home_team,
      away_team: formValue.away_team,
      kickoff_time: new Date(formValue.kickoff_time).toISOString(),
      status: formValue.status,
      actual_home_score: formValue.actual_home_score !== null ? Number(formValue.actual_home_score) : null,
      actual_away_score: formValue.actual_away_score !== null ? Number(formValue.actual_away_score) : null
    });

    if (error) {
      this.errorMessage = 'Failed to update match';
      return;
    }

    this.successMessage = 'Match updated successfully!';
    this.showEditForm = false;
    this.editingMatch = null;
    await this.loadMatches();

    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  cancelEdit(): void {
    this.showEditForm = false;
    this.editingMatch = null;
    this.editForm.reset();
  }

  async deleteMatch(match: Match): Promise<void> {
    if (!confirm(`Are you sure you want to delete the match ${match.home_team} vs ${match.away_team}?`)) {
      return;
    }

    const { error } = await this.matchService.deleteMatch(match.id);

    if (error) {
      this.errorMessage = 'Failed to delete match';
      return;
    }

    this.successMessage = 'Match deleted successfully!';
    await this.loadMatches();

    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  private formatDateTimeForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
