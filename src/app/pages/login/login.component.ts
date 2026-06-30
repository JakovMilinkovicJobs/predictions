import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  magicLinkForm: FormGroup;
  loading = false;
  loadingGoogle = false;
  loadingGitHub = false;
  loadingMagicLink = false;
  errorMessage = '';
  successMessage = '';
  showMagicLink = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.magicLinkForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    const { error } = await this.authService.signIn(email, password);

    this.loading = false;

    if (error) {
      this.errorMessage = error.message || 'Failed to sign in. Please check your credentials.';
    }
  }

  async signInWithGoogle(): Promise<void> {
    this.loadingGoogle = true;
    this.errorMessage = '';

    const { error } = await this.authService.signInWithGoogle();

    // Note: signInWithGoogle redirects to Google, so loading state
    // will remain true until redirect happens
    if (error) {
      this.loadingGoogle = false;
      this.errorMessage = error.message || 'Failed to sign in with Google.';
    }
  }

  async signInWithGitHub(): Promise<void> {
    this.loadingGitHub = true;
    this.errorMessage = '';

    const { error } = await this.authService.signInWithGitHub();

    if (error) {
      this.loadingGitHub = false;
      this.errorMessage = error.message || 'Failed to sign in with GitHub.';
    }
  }

  async sendMagicLink(): Promise<void> {
    // Anonymous auth - no magic link needed
    // Users are automatically logged in
  }

  toggleMagicLink(): void {
    this.showMagicLink = !this.showMagicLink;
    this.errorMessage = '';
    this.successMessage = '';
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get magicEmail() {
    return this.magicLinkForm.get('email');
  }
}
