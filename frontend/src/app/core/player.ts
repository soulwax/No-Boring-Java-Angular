import { HttpInterceptorFn } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';

const ID_KEY = 'oob.player';
const NAME_KEY = 'oob.author';

/**
 * This browser's identity: a random id kept in localStorage plus a display name.
 * `tag` is the same short SHA-256 handle the server broadcasts, so we can spot our own events.
 */
@Injectable({ providedIn: 'root' })
export class PlayerIdentity {
  readonly id = read(ID_KEY) ?? write(ID_KEY, randomId());
  readonly name = signal(read(NAME_KEY) ?? '');
  readonly tag = signal<string | null>(null);

  constructor() {
    effect(() => write(NAME_KEY, this.name()));
    tagFor(this.id).then((tag) => this.tag.set(tag));
  }
}

/** Adds the player headers that the backend's PlayerArgumentResolver reads. */
export const playerHeaders: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }
  const player = inject(PlayerIdentity);
  return next(
    req.clone({
      setHeaders: {
        'X-Chaos-Player': player.id,
        'X-Chaos-Name': encodeURIComponent(player.name()),
      },
    }),
  );
};

export async function tagFor(id: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(id));
  return Array.from(new Uint8Array(hash).slice(0, 6), (b) => b.toString(16).padStart(2, '0')).join('');
}

function randomId(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): string {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable (private mode etc.): identity just won't survive a reload
  }
  return value;
}
