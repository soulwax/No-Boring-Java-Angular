import { TestBed } from '@angular/core/testing';
import { ChaosStream } from './chaos-stream';
import { Thing } from './models';

const thing = (id: number, hype: number, createdAt = '2026-01-01T00:00:00Z'): Thing => ({
  id,
  hype,
  createdAt,
  original: 'x',
  twist: 'X on the Moon',
  author: 'test',
  genre: 'CLASSIC',
  rerolls: 0,
  tier: 'BORING',
  peakTier: 'BORING',
  nextTierAt: 6,
  lore: [],
});

describe('ChaosStream', () => {
  let stream: ChaosStream;

  beforeEach(() => {
    stream = TestBed.inject(ChaosStream);
  });

  it('ranks by hype, newest first on ties', () => {
    stream.upsert(thing(1, 3, '2026-01-01T00:00:00Z'));
    stream.upsert(thing(2, 9));
    stream.upsert(thing(3, 3, '2026-02-01T00:00:00Z'));

    expect(stream.ranked().map((t) => t.id)).toEqual([2, 3, 1]);
    expect(stream.maxHype()).toBe(9);
  });

  it('upsert replaces an existing thing and marks it as last changed', () => {
    stream.upsert(thing(1, 0));
    stream.upsert(thing(1, 6));

    expect(stream.ranked()).toHaveLength(1);
    expect(stream.ranked()[0].hype).toBe(6);
    expect(stream.lastChanged()).toBe(1);
  });

  it('keeps the chronicle newest-first and bounded', () => {
    for (let i = 0; i < 15; i++) {
      stream.record({ emoji: '✍️', text: `entry ${i}`, at: new Date(i * 1000).toISOString() });
    }
    expect(stream.chronicle()).toHaveLength(12);
    expect(stream.chronicle()[0].text).toBe('entry 14');
  });
});
