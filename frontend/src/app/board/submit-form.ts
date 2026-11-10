import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, signal } from '@angular/core';
import { ChaosApi } from '../core/chaos-api';
import { Problem } from '../core/models';

const SUGGESTIONS = [
  'reading the terms and conditions',
  'watching paint dry',
  'alphabetizing the spice rack',
  'calling customer support',
  'waiting for the kettle to boil',
  'updating my printer drivers',
  'standing in line at the post office',
];

const AUTHOR_KEY = 'oob.author';

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
      <div class="row">
        <input aria-label="Your name" maxlength="40" placeholder="Your name (optional)"
          [value]="author()" (input)="author.set(value($event))" />
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

  protected readonly original = signal('');
  protected readonly author = signal(readAuthor());
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly placeholder = pick(SUGGESTIONS);

  constructor() {
    effect(() => saveAuthor(this.author()));
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
    this.api.submit(this.original(), this.author()).subscribe({
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

function readAuthor(): string {
  try {
    return localStorage.getItem(AUTHOR_KEY) ?? '';
  } catch {
    return '';
  }
}

function saveAuthor(author: string): void {
  try {
    localStorage.setItem(AUTHOR_KEY, author);
  } catch {
    // storage unavailable (private mode etc.) – not worth bothering anyone about
  }
}
