import { Component, computed, input, output, signal } from '@angular/core';
import { Thing } from '../core/models';

const BURST = ['🔥', '⚡', '🎉', '💥', '✨', '🚀', '🌶️', '🦄'];

@Component({
  selector: 'app-thing-card',
  host: { '[class.fresh]': 'fresh()', '[style.--hype-pct.%]': 'hypePct()' },
  template: `
    <div class="rank">{{ medal() }}</div>
    <div class="body">
      <p class="original">“{{ thing().original }}” <span>was boring.</span></p>
      @if (thing().rerolls > 0) {
        <p class="twist" [attr.data-reroll]="thing().rerolls">{{ thing().twist }}</p>
      } @else {
        <p class="twist">{{ thing().twist }}</p>
      }
      <p class="meta">
        by {{ thing().author }}
        @if (thing().rerolls > 0) {
          · re-twisted {{ thing().rerolls }}×
        }
      </p>
      <div class="hype-bar"><span></span></div>
    </div>
    <div class="actions">
      <button class="hype" (click)="onHype()" [attr.aria-label]="'Hype it, currently ' + thing().hype">
        🔥 <strong>{{ thing().hype }}</strong>
        @for (b of bursts(); track b.id) {
          <span class="particle" [style.--dx.px]="b.dx" [style.--dy.px]="b.dy">{{ b.emoji }}</span>
        }
      </button>
      <button class="reroll" (click)="reroll.emit(thing().id)" title="Plot twist!">🎲</button>
    </div>
  `,
  styleUrl: './thing-card.scss',
})
export class ThingCard {
  readonly thing = input.required<Thing>();
  readonly rank = input.required<number>();
  readonly fresh = input(false);
  readonly maxHype = input(1);

  readonly hype = output<number>();
  readonly reroll = output<number>();

  protected readonly bursts = signal<{ id: number; emoji: string; dx: number; dy: number }[]>([]);
  protected readonly medal = computed(() => ['🥇', '🥈', '🥉'][this.rank()] ?? `#${this.rank() + 1}`);
  protected readonly hypePct = computed(() => (100 * this.thing().hype) / this.maxHype());

  private burstId = 0;

  protected onHype(): void {
    this.hype.emit(this.thing().id);
    const fresh = Array.from({ length: 7 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 7 + Math.random();
      return {
        id: ++this.burstId,
        emoji: BURST[Math.floor(Math.random() * BURST.length)],
        dx: Math.cos(angle) * 60,
        dy: Math.sin(angle) * 60 - 20,
      };
    });
    this.bursts.update((b) => [...b, ...fresh]);
    const ids = new Set(fresh.map((f) => f.id));
    setTimeout(() => this.bursts.update((b) => b.filter((x) => !ids.has(x.id))), 800);
  }
}
