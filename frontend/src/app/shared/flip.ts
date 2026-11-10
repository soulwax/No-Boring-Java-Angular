import { afterRenderEffect, Directive, ElementRef, inject, input } from '@angular/core';

const DURATION_MS = 450;

/**
 * FLIP animation for a reordering list: after each render, every child marked with
 * `data-flip-id` that moved is played back from its old position to its new one.
 * Uses `offsetTop`, so page scrolling never counts as movement.
 *
 * Usage: `<div [appFlip]="items()">` with `[attr.data-flip-id]="item.id"` on each child.
 */
@Directive({ selector: '[appFlip]' })
export class Flip {
  /** Whatever the list renders; a change triggers measuring. */
  readonly appFlip = input.required<unknown>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private positions = new Map<string, number>();

  constructor() {
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    afterRenderEffect(() => {
      this.appFlip();
      const next = new Map<string, number>();
      for (const child of Array.from(this.host.nativeElement.children) as HTMLElement[]) {
        const id = child.dataset['flipId'];
        if (!id) {
          continue;
        }
        const top = child.offsetTop;
        const before = this.positions.get(id);
        if (before !== undefined && before !== top && !reduceMotion && typeof child.animate === 'function') {
          child.animate(
            [{ transform: `translateY(${before - top}px)` }, { transform: 'none' }],
            { duration: DURATION_MS, easing: 'cubic-bezier(.2, .8, .2, 1)' },
          );
        }
        next.set(id, top);
      }
      this.positions = next;
    });
  }
}
