import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/leagues/leagues.component').then(m => m.LeaguesComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
