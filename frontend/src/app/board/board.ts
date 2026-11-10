import { Component, computed, DestroyRef, inject } from '@angular/core';
import { ChaosApi } from '../core/chaos-api';
import { ChaosStream } from '../core/chaos-stream';
import { ChaosMeterGauge } from './chaos-meter';
import { SubmitForm } from './submit-form';
import { ThingCard } from './thing-card';

@Component({
  selector: 'app-board',
  imports: [ChaosMeterGauge, SubmitForm, ThingCard],
  host: { '[class.mayhem]': 'mayhem()' },
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  protected readonly stream = inject(ChaosStream);
  private readonly api = inject(ChaosApi);

  protected readonly mayhem = computed(() => (this.stream.meter()?.level ?? 0) >= 70);

  constructor() {
    inject(DestroyRef).onDestroy(this.stream.connect());
  }

  protected hype(id: number): void {
    this.api.hype(id).subscribe();
  }

  protected reroll(id: number): void {
    this.api.reroll(id).subscribe();
  }
}
