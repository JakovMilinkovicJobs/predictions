import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/leagues',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'leagues',
    loadComponent: () => import('./pages/leagues/leagues.component').then(m => m.LeaguesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'create-league',
    loadComponent: () => import('./pages/create-league/create-league.component').then(m => m.CreateLeagueComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'join-league',
    loadComponent: () => import('./pages/join-league/join-league.component').then(m => m.JoinLeagueComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'league/:id',
    loadComponent: () => import('./pages/league-detail/league-detail.component').then(m => m.LeagueDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/leagues'
  }
];
