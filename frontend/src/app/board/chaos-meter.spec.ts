import { TestBed } from '@angular/core/testing';
import { ChaosMeterGauge } from './chaos-meter';

describe('ChaosMeterGauge', () => {
  it('swings the needle and exposes the level to assistive tech', async () => {
    const fixture = TestBed.createComponent(ChaosMeterGauge);
    fixture.componentRef.setInput('level', 50);
    fixture.componentRef.setInput('mood', 'Chaotic Good');
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('svg')?.getAttribute('aria-valuenow')).toBe('50');
    expect((el.querySelector('.needle') as SVGElement).style.transform).toBe('rotate(0deg)');
    expect(el.querySelector('.mood')?.textContent).toBe('Chaotic Good');
  });
});
