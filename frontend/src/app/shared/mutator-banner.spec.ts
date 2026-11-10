import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ChaosStream } from '../core/chaos-stream';
import { MutatorState } from '../core/models';
import { MutatorBanner } from './mutator-banner';

describe('MutatorBanner', () => {
  const activeMutator = signal<MutatorState | null>(null);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ChaosStream, useValue: { activeMutator } }],
    });
  });

  it('stays hidden when calm, and counts down while a mutator runs', async () => {
    const fixture = TestBed.createComponent(MutatorBanner);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.banner')).toBeNull();

    activeMutator.set({
      active: true,
      code: 'DOUBLE_HYPE',
      emoji: '⚡',
      title: 'Double Hype',
      description: 'Every hype counts twice.',
      genre: null,
      endsAt: new Date(Date.now() + 30_000).toISOString(),
    });
    await fixture.whenStable();

    expect(el.querySelector('strong')?.textContent).toBe('Double Hype');
    expect(el.querySelector('.clock')?.textContent).toMatch(/^(29|30)s$/);
    activeMutator.set(null);
  });
});
