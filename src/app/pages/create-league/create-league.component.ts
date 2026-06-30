import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LeagueService } from '../../services/league.service';
import { CompetitionService } from '../../services/competition.service';
import { Competition } from '../../models/competition.model';

@Component({
  selector: 'app-create-league',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-league.component.html',
  styleUrl: './create-league.component.scss'
})
export class CreateLeagueComponent implements OnInit {
  createForm: FormGroup;
  loading = false;
  errorMessage = '';
  competitions: Competition[] = [];
  loadingCompetitions = true;

  constructor(
    private fb: FormBuilder,
    private leagueService: LeagueService,
    private competitionService: CompetitionService,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      competition_id: ['', Validators.required],
      points_exact_score: [3, [Validators.required, Validators.min(0)]],
      points_outcome: [1, [Validators.required, Validators.min(0)]],
      max_participants: [50, [Validators.required, Validators.min(2)]]
    });
  }

  ngOnInit(): void {
    this.loadCompetitions();
  }

  loadCompetitions(): void {
    this.competitionService.getAll().subscribe({
      next: (competitions) => {
        this.competitions = competitions;
        this.loadingCompetitions = false;
      },
      error: (error) => {
        console.error('Failed to load competitions:', error);
        this.loadingCompetitions = false;
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.createForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { data, error } = await this.leagueService.createLeague(this.createForm.value);

    this.loading = false;

    if (error) {
      this.errorMessage = error.message || 'Failed to create league';
      return;
    }

    if (data) {
      this.router.navigate(['/league', data.id]);
    }
  }

  get name() {
    return this.createForm.get('name');
  }

  get competition_id() {
    return this.createForm.get('competition_id');
  }

  get points_exact_score() {
    return this.createForm.get('points_exact_score');
  }

  get points_outcome() {
    return this.createForm.get('points_outcome');
  }

  get max_participants() {
    return this.createForm.get('max_participants');
  }
}
