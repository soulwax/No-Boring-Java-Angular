import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { ChaosStream } from './chaos-stream';
import { Thing } from './models';

/**
 * REST mutations. Every response is also folded into the live store right away,
 * so the clicking tab feels instant even before the SSE echo arrives.
 */
@Injectable({ providedIn: 'root' })
export class ChaosApi {
  private readonly http = inject(HttpClient);
  private readonly stream = inject(ChaosStream);

  submit(original: string, author: string) {
    return this.http
      .post<Thing>('/api/things', { original, author })
      .pipe(tap((thing) => this.stream.upsert(thing)));
  }

  hype(id: number) {
    return this.http
      .post<Thing>(`/api/things/${id}/hype`, null)
      .pipe(tap((thing) => this.stream.upsert(thing)));
  }

  reroll(id: number) {
    return this.http
      .post<Thing>(`/api/things/${id}/reroll`, null)
      .pipe(tap((thing) => this.stream.upsert(thing)));
  }
}
