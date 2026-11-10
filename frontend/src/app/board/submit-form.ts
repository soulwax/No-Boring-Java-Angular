import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { GENRE_CODES, GENRES } from '../core/catalog';
import { ChaosApi } from '../core/chaos-api';
import { ChaosStream } from '../core/chaos-stream';
import { Genre, Problem } from '../core/models';
import { PlayerIdentity } from '../core/player';

const SUGGESTIONS = [
  'reading the terms and conditions',
  'watching paint dry',
  'alphabetizing the spice rack',
  'calling customer support',
  'waiting for the kettle to boil',
  'updating my printer drivers',
  'standing in line at the post office',
];

@Component({
  selector: 'app-submit-form',
  template: `
    <form (submit)="submit($event)">
      <label for="original">What's boring you right now?</label>
      <div class="row">
        <input id="original" maxlength="140" autocomplete="off"
          placeholder="e.g. {{ placeholder }}"
          [value]="original()" (input)="original.set(value($event))" />
        <button type="button" class="ghost" (click)="surprise()" title="Suggest something boring">🥱</button>
      </div>

      <fieldset class="genres" [disabled]="lockedGenre() !== null">
        <legend>
          @if (lockedGenre(); as locked) {
            🎬 Genre Lock: everything is {{ genres[locked].label }} right now
          } @else {
            Pick a genre
          }
        </legend>
        <button type="button" class="chip" [class.on]="effectiveGenre() === null"
          [attr.aria-pressed]="effectiveGenre() === null" (click)="genre.set(null)">
          🎰 Surprise me
        </button>
        @for (code of genreCodes; track code) {
          <button type="button" class="chip" [class.on]="effectiveGenre() === code"
            [attr.aria-pressed]="effectiveGenre() === code" (click)="genre.set(code)">
            {{ genres[code].emoji }} {{ genres[code].label }}
          </button>
        }
      </fieldset>

      <div class="row">
        <input aria-label="Your name" maxlength="40" placeholder="Your name (optional)"
          [value]="player.name()" (input)="player.name.set(value($event))" />
        <button type="submit" [disabled]="busy() || !original().trim()">
          {{ busy() ? 'Twisting…' : 'Annihilate boredom 💥' }}
        </button>
      </div>
      @if (error(); as message) {
        <p class="error" role="alert">{{ message }}</p>
      }
    </form>
  `,
  styleUrl: './submit-form.scss',
})
export class SubmitForm {
  private readonly api = inject(ChaosApi);
  private readonly stream = inject(ChaosStream);
  protected readonly player = inject(PlayerIdentity);

  protected readonly genres = GENRES;
  protected readonly genreCodes = GENRE_CODES;

  protected readonly original = signal('');
  /** `null` = surprise me */
  protected readonly genre = signal<Genre | null>(null);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly placeholder = pick(SUGGESTIONS);

  protected readonly lockedGenre = computed(() => this.stream.activeMutator()?.genre ?? null);
  protected readonly effectiveGenre = computed(() => this.lockedGenre() ?? this.genre());

  constructor() {
    // Clear a stale error as soon as the user edits their submission
    effect(() => {
      this.original();
      this.error.set(null);
    });
  }

  protected surprise(): void {
    this.original.set(pick(SUGGESTIONS));
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.busy.set(true);
    this.api.submit(this.original(), this.player.name(), this.genre()).subscribe({
      next: () => {
        this.original.set('');
        this.busy.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const problem = err.error as Problem | null;
        this.error.set(
          problem?.errors?.['original'] ?? problem?.detail ?? 'The backend is snoozing. Is it running?',
        );
        this.busy.set(false);
      },
    });
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
