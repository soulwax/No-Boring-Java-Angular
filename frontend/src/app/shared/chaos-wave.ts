import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChaosStream } from '../core/chaos-stream';
import { ChaosWave } from '../core/models';

const EMOJI = ['🔥', '⚡', '🎉', '💥', '✨', '🚀', '🌶️', '🦄', '🌊', '🎸', '🪩'];
const DURATION_MS = 4500;

interface Drop {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  size: number;
}

/** Full-screen emoji storm, broadcast to every tab when the Chaos Meter boils over. */
@Component({
  selector: 'app-chaos-wave',
  template: `
    @if (wave(); as w) {
      <div class="banner">
        🌊 CHAOS WAVE 🌊
        <small>unleashed by {{ w.by }}</small>
      </div>
      @for (drop of drops(); track drop.id) {
        <span class="drop" [style.left.%]="drop.x" [style.animation-delay.ms]="drop.delay"
          [style.font-size.rem]="drop.size">{{ drop.emoji }}</span>
      }
    }
  `,
  styles: `
    :host { position: fixed; inset: 0; pointer-events: none; z-index: 30; overflow: hidden; }
    .banner {
      position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%);
      padding: 1rem 2rem; border-radius: 1.5rem;
      background: var(--ink); color: var(--bg);
      font: 800 clamp(1.6rem, 6vw, 3.5rem)/1.1 var(--display); text-align: center;
      box-shadow: 10px 10px 0 var(--hot);
      animation: slam 600ms cubic-bezier(.34, 1.56, .64, 1), fade 600ms ease-in 3.9s forwards;
      small { display: block; font-size: 1rem; font-weight: 600; opacity: .8; }
    }
    .drop { position: absolute; top: -3rem; animation: fall 2.6s ease-in forwards; }
    @keyframes fall { to { transform: translateY(110vh) rotate(540deg); } }
    @keyframes slam { from { transform: translate(-50%, -50%) scale(3) rotate(-8deg); opacity: 0; } }
    @keyframes fade { to { opacity: 0; } }
  `,
})
export class ChaosWaveOverlay {
  protected readonly wave = signal<ChaosWave | null>(null);
  protected readonly drops = signal<Drop[]>([]);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(ChaosStream)
      .waves$.pipe(takeUntilDestroyed())
      .subscribe((w) => this.unleash(w));
  }

  private unleash(wave: ChaosWave): void {
    this.wave.set(wave);
    this.drops.set(
      Array.from({ length: 60 }, (_, id) => ({
        id,
        emoji: EMOJI[Math.floor(Math.random() * EMOJI.length)],
        x: Math.random() * 100,
        delay: Math.random() * 1800,
        size: 1.2 + Math.random() * 2,
      })),
    );
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.wave.set(null), DURATION_MS);
  }
}
