import { Component, inject } from '@angular/core';
import { ChaosStream } from '../core/chaos-stream';

/** The room's story so far, newest on top. */
@Component({
  selector: 'app-chronicle-feed',
  template: `
    <h3>The Chronicle</h3>
    <ol aria-live="polite">
      @for (entry of chronicle(); track entry.at + entry.text) {
        <li>
          <span class="emoji">{{ entry.emoji }}</span>
          <span class="text">{{ entry.text }}</span>
          <time [attr.datetime]="entry.at">{{ ago(entry.at) }}</time>
        </li>
      } @empty {
        <li class="quiet">Nothing has happened yet. Suspiciously quiet…</li>
      }
    </ol>
  `,
  styles: `
    h3 { margin: 0 0 .6rem; font: 800 1.1rem var(--display); }
    ol { list-style: none; margin: 0; padding: 0; display: grid; gap: .45rem; }
    li {
      display: grid; grid-template-columns: 1.6rem 1fr auto; gap: .4rem; align-items: baseline;
      font-size: .85rem; line-height: 1.3;
      animation: slide-in 400ms cubic-bezier(.34, 1.56, .64, 1);
    }
    li:nth-child(n + 6) { opacity: .6; }
    .emoji { text-align: center; }
    time { font-size: .7rem; opacity: .5; white-space: nowrap; }
    .quiet { display: block; opacity: .6; font-style: italic; }
    @keyframes slide-in { from { transform: translateX(-1rem); opacity: 0; } }
  `,
})
export class ChronicleFeed {
  protected readonly chronicle = inject(ChaosStream).chronicle;

  /** Relative time, refreshed whenever the feed re-renders (which is often). */
  protected ago(at: string): string {
    const seconds = Math.max(0, Math.round((Date.now() - Date.parse(at)) / 1000));
    if (seconds < 10) {
      return 'just now';
    }
    if (seconds < 60) {
      return `${seconds}s ago`;
    }
    return `${Math.floor(seconds / 60)}m ago`;
  }
}
