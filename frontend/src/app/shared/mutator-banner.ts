import { Component, computed, effect, inject, signal } from '@angular/core';
import { ChaosStream } from '../core/chaos-stream';

/** Sticky banner for the room-wide mutator, with a live countdown. */
@Component({
  selector: 'app-mutator-banner',
  host: { '[class.shown]': 'mutator() !== null' },
  template: `
    @if (mutator(); as m) {
      <div class="banner" role="status" [attr.data-code]="m.code">
        <span class="emoji">{{ m.emoji }}</span>
        <div class="text">
          <strong>{{ m.title }}</strong>
          <small>{{ m.description }}</small>
        </div>
        <span class="clock" [attr.aria-label]="secondsLeft() + ' seconds left'">{{ secondsLeft() }}s</span>
        <span class="fuse" [style.animation-duration.ms]="totalMs()"></span>
      </div>
    }
  `,
  styles: `
    :host { display: block; position: sticky; top: 0; z-index: 15; }
    .banner {
      position: relative; overflow: hidden;
      display: flex; align-items: center; gap: .8rem;
      margin: 0 0 1.5rem; padding: .7rem 1rem;
      border-radius: 1rem; border: 2px solid var(--border);
      background: var(--ink); color: var(--bg);
      box-shadow: 6px 6px 0 var(--hot);
      animation: drop-in 450ms cubic-bezier(.34, 1.56, .64, 1);
    }
    .banner[data-code='FROZEN_TIME'] { box-shadow: 6px 6px 0 #6ad3ff; }
    .banner[data-code='TWIST_TORNADO'] .emoji { animation: spin 1.2s linear infinite; }
    .emoji { font-size: 1.8rem; }
    .text { flex: 1; display: flex; flex-direction: column; }
    strong { font-family: var(--display); font-size: 1.1rem; }
    small { opacity: .75; }
    .clock { font: 800 1.6rem/1 var(--display); font-variant-numeric: tabular-nums; }
    .fuse {
      position: absolute; left: 0; bottom: 0; height: 4px; width: 100%;
      background: linear-gradient(90deg, var(--cool), var(--hot), var(--nuclear));
      transform-origin: left; animation: burn linear forwards;
    }
    @keyframes burn { to { transform: scaleX(0); } }
    @keyframes drop-in { from { transform: scale(.94); opacity: 0; } }
    @keyframes spin { to { transform: rotate(360deg); } }
  `,
})
export class MutatorBanner {
  protected readonly mutator = inject(ChaosStream).activeMutator;
  private readonly now = signal(Date.now());

  protected readonly secondsLeft = computed(() => {
    const endsAt = this.mutator()?.endsAt;
    return endsAt ? Math.max(0, Math.ceil((Date.parse(endsAt) - this.now()) / 1000)) : 0;
  });
  /** Remaining time when the banner appeared, so the fuse burns at the right speed */
  protected readonly totalMs = computed(() => {
    const endsAt = this.mutator()?.endsAt;
    return endsAt ? Math.max(0, Date.parse(endsAt) - Date.now()) : 0;
  });

  constructor() {
    // Tick only while a mutator is running
    effect((onCleanup) => {
      if (!this.mutator()) {
        return;
      }
      this.now.set(Date.now());
      const timer = setInterval(() => this.now.set(Date.now()), 1000);
      onCleanup(() => clearInterval(timer));
    });
  }
}
