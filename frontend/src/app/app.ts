import { Component, DestroyRef, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChaosStream } from './core/chaos-stream';
import { ChaosWaveOverlay } from './shared/chaos-wave';
import { MutatorBanner } from './shared/mutator-banner';
import { Toasts } from './shared/toasts';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Toasts, ChaosWaveOverlay, MutatorBanner],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  constructor() {
    // One stream for the whole app, so toasts, waves and mutators reach you on every page
    inject(DestroyRef).onDestroy(inject(ChaosStream).connect());
  }
}
