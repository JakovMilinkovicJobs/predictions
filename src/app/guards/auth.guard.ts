import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait a moment for anonymous auth to complete
  await new Promise(resolve => setTimeout(resolve, 500));

  if (authService.isAuthenticated) {
    return true;
  }

  // If still not authenticated after waiting, sign in anonymously
  await authService.signInAnonymously();

  return true;
};
