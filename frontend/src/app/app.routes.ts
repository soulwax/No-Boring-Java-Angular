import { Routes } from '@angular/router';
import { Board } from './board/board';

export const routes: Routes = [
  { path: '', component: Board, title: 'Opposite of Boring' },
  {
    path: 'trophies',
    loadComponent: () => import('./trophies/trophies').then((m) => m.Trophies),
    title: 'Trophies · Opposite of Boring',
  },
  {
    path: 'how-it-works',
    loadComponent: () => import('./how-it-works/how-it-works').then((m) => m.HowItWorks),
    title: 'How it works · Opposite of Boring',
  },
  { path: '**', redirectTo: '' },
];
