import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { App } from './app';
import { ChaosStream } from './core/chaos-stream';

describe('App', () => {
  const connect = vi.fn(() => () => {});

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        // jsdom has no EventSource; the real stream is covered in chaos-stream.spec.ts
        {
          provide: ChaosStream,
          useValue: {
            connect,
            achievements$: new Subject(),
            waves$: new Subject(),
            activeMutator: signal(null),
          },
        },
      ],
    }).compileComponents();
  });

  it('renders the brand and navigation and opens the live stream once', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.logo')?.textContent).toContain('Opposite of Boring');
    expect(compiled.querySelectorAll('nav a').length).toBe(3);
    expect(connect).toHaveBeenCalledOnce();
  });
});
