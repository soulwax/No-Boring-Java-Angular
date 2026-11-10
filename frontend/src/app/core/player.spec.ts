import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PlayerIdentity, playerHeaders, tagFor } from './player';

describe('player identity', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([playerHeaders])), provideHttpClientTesting()],
    });
  });

  it('adds player headers to /api calls only, URL-encoding the name', () => {
    const player = TestBed.inject(PlayerIdentity);
    player.name.set('Zöe');
    const http = TestBed.inject(HttpClient);
    const backend = TestBed.inject(HttpTestingController);

    http.get('/api/meter').subscribe();
    http.get('/actuator/health').subscribe();

    const api = backend.expectOne('/api/meter').request;
    expect(api.headers.get('X-Chaos-Player')).toBe(player.id);
    expect(api.headers.get('X-Chaos-Name')).toBe('Z%C3%B6e');
    expect(backend.expectOne('/actuator/health').request.headers.has('X-Chaos-Player')).toBe(false);
  });

  it('keeps the same id across instances via localStorage', () => {
    const first = TestBed.inject(PlayerIdentity).id;
    TestBed.resetTestingModule();
    expect(TestBed.inject(PlayerIdentity).id).toBe(first);
  });

  it('computes the same 12-char tag as the backend', async () => {
    // Player.tag() in Java: first 6 bytes of SHA-256, hex
    expect(await tagFor('ada-1234-5678')).toMatch(/^[0-9a-f]{12}$/);
    expect(await tagFor('ada-1234-5678')).toBe(await tagFor('ada-1234-5678'));
  });
});
