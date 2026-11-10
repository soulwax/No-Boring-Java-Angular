import { httpResource } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ChaosStream } from '../core/chaos-stream';
import { Achievement } from '../core/models';
import { PlayerIdentity } from '../core/player';

@Component({
  selector: 'app-trophies',
  template: `
    <h1>Your trophy shelf</h1>
    @if (trophies.hasValue()) {
      <p class="progress">
        <strong>{{ unlockedCount() }} / {{ trophies.value().length }}</strong> unlocked
        <span class="bar"><span [style.width.%]="percent()"></span></span>
      </p>
      <div class="grid">
        @for (t of trophies.value(); track t.code) {
          <article [class.unlocked]="t.unlocked">
            <span class="emoji">{{ t.unlocked ? t.emoji : '🔒' }}</span>
            <h3>{{ t.title }}</h3>
            <p>{{ t.description }}</p>
          </article>
        }
      </div>
    } @else if (trophies.error()) {
      <p>Couldn't reach the trophy room. Is the backend running?</p>
    } @else {
      <p>Polishing trophies…</p>
    }
    <p class="note">Progress is tied to this browser and resets when the server restarts. Chaos is fleeting.</p>
  `,
  styles: `
    h1 { font: 800 clamp(1.8rem, 4vw, 2.8rem)/1.1 var(--display); margin: 0 0 1rem; }
    .progress { display: flex; align-items: center; gap: .8rem; }
    .bar { flex: 1; max-width: 20rem; height: 10px; border-radius: 99px; background: var(--surface-2); overflow: hidden; }
    .bar span {
      display: block; height: 100%; transition: width 600ms ease;
      background: linear-gradient(90deg, var(--cool), var(--hot), var(--nuclear));
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); gap: 1rem; }
    article {
      padding: 1.1rem; border-radius: 1.1rem; background: var(--surface);
      border: 2px dashed var(--border); opacity: .55; filter: grayscale(1);
      transition: transform 200ms ease;
    }
    article.unlocked {
      opacity: 1; filter: none; border-style: solid; box-shadow: 5px 5px 0 var(--shadow);
      &:hover { transform: rotate(-1.5deg) scale(1.03); }
    }
    .emoji { font-size: 2.2rem; }
    h3 { margin: .3rem 0; font-family: var(--display); }
    p { margin: 0; }
    .note { margin-top: 2rem; font-size: .8rem; opacity: .6; }
  `,
})
export class Trophies {
  protected readonly trophies = httpResource<Achievement[]>(() => '/api/achievements');
  protected readonly unlockedCount = computed(
    () => this.trophies.value()?.filter((t) => t.unlocked).length ?? 0,
  );
  protected readonly percent = computed(
    () => (100 * this.unlockedCount()) / (this.trophies.value()?.length || 1),
  );

  constructor() {
    const player = inject(PlayerIdentity);
    // Live refresh: when one of *our* achievements is broadcast, re-fetch the shelf
    inject(ChaosStream)
      .achievements$.pipe(
        filter((a) => a.playerTag === player.tag()),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.trophies.reload());
  }
}
