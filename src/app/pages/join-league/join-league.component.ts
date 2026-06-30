import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LeagueService } from '../../services/league.service';

@Component({
  selector: 'app-join-league',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './join-league.component.html',
  styleUrl: './join-league.component.scss'
})
export class JoinLeagueComponent {
  joinForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private leagueService: LeagueService,
    private router: Router
  ) {
    this.joinForm = this.fb.group({
      invite_code: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.joinForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { data, error } = await this.leagueService.joinLeague(this.joinForm.value);

    this.loading = false;

    if (error) {
      this.errorMessage = error.message || 'Failed to join league. Please check the invite code.';
      return;
    }

    if (data) {
      this.router.navigate(['/league', data.id]);
    }
  }

  get inviteCode() {
    return this.joinForm.get('invite_code');
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.joinForm.patchValue({ invite_code: input.value });
  }
}
