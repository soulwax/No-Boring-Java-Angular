import { computed, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import {
  AchievementUnlocked,
  ChaosMeter,
  ChaosWave,
  ChronicleEntry,
  MutatorState,
  Thing,
} from './models';

const CHRONICLE_SIZE = 12;

/**
 * Signal store fed by the backend's Server-Sent Events stream (/api/stream).
 * EventSource reconnects on its own; the server re-sends a full snapshot on every connect.
 *
 * State (board, meter, presence, mutator, chronicle) lives in signals. One-off happenings
 * (achievements, waves) are Observables instead: a signal would swallow two identical events in a row.
 */
@Injectable({ providedIn: 'root' })
export class ChaosStream {
  private readonly things = signal<Thing[]>([]);
  private readonly achievementSubject = new Subject<AchievementUnlocked>();
  private readonly waveSubject = new Subject<ChaosWave>();

  readonly meter = signal<ChaosMeter | null>(null);
  readonly online = signal(0);
  readonly connected = signal(false);
  readonly mutator = signal<MutatorState | null>(null);
  /** Newest first */
  readonly chronicle = signal<ChronicleEntry[]>([]);
  /** Id of the most recently changed thing, used to flash its card. */
  readonly lastChanged = signal<number | null>(null);

  readonly achievements$ = this.achievementSubject.asObservable();
  readonly waves$ = this.waveSubject.asObservable();

  readonly ranked = computed(() =>
    [...this.things()].sort(
      (a, b) => b.hype - a.hype || b.createdAt.localeCompare(a.createdAt),
    ),
  );
  readonly maxHype = computed(() => Math.max(1, ...this.things().map((t) => t.hype)));
  readonly activeMutator = computed(() => {
    const m = this.mutator();
    return m?.active ? m : null;
  });

  /** Opens the stream and returns a function that closes it. */
  connect(url = '/api/stream'): () => void {
    const source = new EventSource(url);
    source.onopen = () => this.connected.set(true);
    source.onerror = () => this.connected.set(false);

    on<Thing[]>(source, 'board', (board) => this.things.set(board));
    on<Thing>(source, 'thing', (thing) => this.upsert(thing));
    on<ChaosMeter>(source, 'meter', (meter) => this.meter.set(meter));
    on<{ online: number }>(source, 'presence', ({ online }) => this.online.set(online));
    on<MutatorState>(source, 'mutator', (m) => this.mutator.set(m));
    on<ChronicleEntry[]>(source, 'chronicle', (entries) =>
      this.chronicle.set(entries.slice(0, CHRONICLE_SIZE)),
    );
    on<ChronicleEntry>(source, 'activity', (entry) => this.record(entry));
    on<AchievementUnlocked>(source, 'achievement', (a) => this.achievementSubject.next(a));
    on<ChaosWave>(source, 'wave', (w) => this.waveSubject.next(w));

    return () => {
      source.close();
      this.connected.set(false);
    };
  }

  upsert(thing: Thing): void {
    this.things.update((all) => {
      const index = all.findIndex((t) => t.id === thing.id);
      if (index === -1) {
        return [...all, thing];
      }
      const copy = [...all];
      copy[index] = thing;
      return copy;
    });
    this.lastChanged.set(thing.id);
  }

  record(entry: ChronicleEntry): void {
    this.chronicle.update((list) => [entry, ...list].slice(0, CHRONICLE_SIZE));
  }
}

function on<T>(source: EventSource, type: string, handle: (data: T) => void): void {
  source.addEventListener(type, (event) => handle(JSON.parse((event as MessageEvent).data)));
}
