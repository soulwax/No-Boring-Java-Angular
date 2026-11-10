import { Component, computed, input } from '@angular/core';

/** Semicircle gauge: the arc fills and the needle swings as `level` (0-100) changes. */
@Component({
  selector: 'app-chaos-meter',
  template: `
    <svg viewBox="0 0 200 120" role="meter" [attr.aria-valuenow]="level()" aria-valuemin="0"
      aria-valuemax="100" [attr.aria-valuetext]="mood()">
      <defs>
        <linearGradient id="chaos-gradient" x1="0" x2="1">
          <stop offset="0%" stop-color="var(--cool)" />
          <stop offset="55%" stop-color="var(--hot)" />
          <stop offset="100%" stop-color="var(--nuclear)" />
        </linearGradient>
      </defs>
      <path class="track" d="M20 100 A80 80 0 0 1 180 100" pathLength="100" />
      <path class="fill" d="M20 100 A80 80 0 0 1 180 100" pathLength="100"
        [style.stroke-dasharray]="level() + ' 100'" />
      <g class="needle" [style.transform]="needle()">
        <line x1="100" y1="100" x2="100" y2="34" />
        <circle cx="100" cy="100" r="7" />
      </g>
    </svg>
    <div class="readout">
      <span class="level">{{ level() }}</span>
      <span class="mood">{{ mood() }}</span>
    </div>
  `,
  styles: `
    :host { display: block; text-align: center; }
    svg { width: 100%; max-width: 280px; overflow: visible; }
    path { fill: none; stroke-width: 16; stroke-linecap: round; }
    .track { stroke: var(--surface-2); }
    .fill {
      stroke: url(#chaos-gradient);
      transition: stroke-dasharray 600ms cubic-bezier(.34, 1.56, .64, 1);
    }
    .needle {
      transform-origin: 100px 100px;
      transition: transform 600ms cubic-bezier(.34, 1.56, .64, 1);
      line { stroke: var(--ink); stroke-width: 4; stroke-linecap: round; }
      circle { fill: var(--ink); }
    }
    .readout { display: flex; flex-direction: column; margin-top: -.5rem; }
    .level { font: 800 2.5rem/1 var(--display); }
    .mood { text-transform: uppercase; letter-spacing: .12em; font-size: .8rem; opacity: .75; }
  `,
})
export class ChaosMeterGauge {
  readonly level = input.required<number>();
  readonly mood = input.required<string>();

  protected readonly needle = computed(() => `rotate(${-90 + this.level() * 1.8}deg)`);
}
