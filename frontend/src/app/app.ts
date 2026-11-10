import { Component, DestroyRef, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChaosStream } from './core/chaos-stream';
import { ChaosWaveOverlay } from './shared/chaos-wave';
import { Toasts } from './shared/toasts';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Toasts, ChaosWaveOverlay],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  constructor() {
    // One stream for the whole app, so toasts and waves reach you on every page
    inject(DestroyRef).onDestroy(inject(ChaosStream).connect());
  }
}
