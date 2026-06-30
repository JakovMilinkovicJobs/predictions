import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is already authenticated
  if (authService.isAuthenticated) {
    return true;
  }

  // Wait for auth state to initialize
  await new Promise(resolve => setTimeout(resolve, 300));

  if (authService.isAuthenticated) {
    return true;
  }

  // Not authenticated - redirect to login
  router.navigate(['/login']);
  return false;
};
