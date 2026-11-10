import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChaosStream } from '../core/chaos-stream';
import { AchievementUnlocked } from '../core/models';
import { PlayerIdentity } from '../core/player';

interface Toast extends AchievementUnlocked {
  id: number;
  mine: boolean;
}

const VISIBLE_MS = 5000;

/** Announces every achievement unlocked by anyone, and celebrates your own a bit louder. */
@Component({
  selector: 'app-toasts',
  template: `
    @for (toast of toasts(); track toast.id) {
      <div class="toast" [class.mine]="toast.mine" role="status">
        <span class="emoji">{{ toast.emoji }}</span>
        <div>
          <strong>{{ toast.mine ? 'You' : toast.playerName }} unlocked “{{ toast.title }}”</strong>
          <small>{{ toast.description }}</small>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      position: fixed; right: 16px; bottom: 16px; z-index: 20;
      display: flex; flex-direction: column; gap: .6rem;
      width: min(22rem, calc(100vw - 32px));
      pointer-events: none;
    }
    .toast {
      display: flex; gap: .8rem; align-items: center;
      padding: .8rem 1rem; border-radius: 1rem;
      background: var(--surface); border: 2px solid var(--border);
      box-shadow: 5px 5px 0 var(--shadow);
      animation: pop-in 400ms cubic-bezier(.34, 1.56, .64, 1);
    }
    .toast.mine { border-color: var(--hot); box-shadow: 5px 5px 0 var(--hot); }
    .emoji { font-size: 1.8rem; }
    strong { display: block; font-family: var(--display); }
    small { opacity: .7; }
    @keyframes pop-in {
      from { transform: translateY(1.5rem) scale(.8); opacity: 0; }
    }
  `,
})
export class Toasts {
  private readonly player = inject(PlayerIdentity);
  protected readonly toasts = signal<Toast[]>([]);
  private nextId = 0;

  constructor() {
    inject(ChaosStream)
      .achievements$.pipe(takeUntilDestroyed())
      .subscribe((a) => this.show(a));
  }

  private show(achievement: AchievementUnlocked): void {
    const toast = { ...achievement, id: ++this.nextId, mine: achievement.playerTag === this.player.tag() };
    this.toasts.update((list) => [...list.slice(-3), toast]);
    setTimeout(() => this.toasts.update((list) => list.filter((t) => t.id !== toast.id)), VISIBLE_MS);
  }
}
