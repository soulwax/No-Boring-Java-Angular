import { TestBed } from '@angular/core/testing';
import { Thing } from '../core/models';
import { ThingCard } from './thing-card';

const legendary: Thing = {
  id: 7,
  original: 'ironing shirts',
  twist: 'Hear ye! Ironing shirts atop a dragon-scorched mountain…',
  author: 'Ada',
  genre: 'MEDIEVAL',
  hype: 24,
  rerolls: 0,
  tier: 'SPICY',
  peakTier: 'LEGENDARY',
  nextTierAt: 30,
  lore: ['A small crowd has gathered.', 'It is trending in three countries.', 'Historians argue.'],
  createdAt: '2026-11-10T12:00:00Z',
};

describe('ThingCard', () => {
  it('shows genre, peak tier, lore and the distance to the next tier', async () => {
    const fixture = TestBed.createComponent(ThingCard);
    fixture.componentRef.setInput('thing', legendary);
    fixture.componentRef.setInput('rank', 0);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.getAttribute('data-tier')).toBe('LEGENDARY');
    expect(el.querySelector('.genre')?.textContent).toContain('Medieval');
    expect(el.querySelector('.tier')?.textContent).toContain('Legendary');
    expect(el.querySelectorAll('.lore li').length).toBe(3);
    // Hype decayed to Spicy; Legendary at 30 was already reached once, so it's a reclaim
    expect(el.querySelector('.next')?.textContent).toContain('6 hype to reclaim 👑 Legendary');
  });

  it('emits hype with the thing id', async () => {
    const fixture = TestBed.createComponent(ThingCard);
    fixture.componentRef.setInput('thing', legendary);
    fixture.componentRef.setInput('rank', 3);
    const hyped: number[] = [];
    fixture.componentInstance.hype.subscribe((id) => hyped.push(id));
    await fixture.whenStable();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.hype')!.click();
    expect(hyped).toEqual([7]);
  });
});
