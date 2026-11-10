import { httpResource } from '@angular/common/http';
import { Component } from '@angular/core';

interface Feature {
  layer: 'Spring Boot' | 'Angular';
  title: string;
  where: string;
  what: string;
}

const FEATURES: Feature[] = [
  { layer: 'Spring Boot', title: 'Server-Sent Events', where: 'live/ChaosBroadcaster.java',
    what: 'One SseEmitter per tab. Every change is pushed to everyone instantly. No polling, no WebSocket broker.' },
  { layer: 'Spring Boot', title: 'Transactional domain events', where: 'board/ChaosService.java',
    what: 'The service publishes ChaosEvents; @TransactionalEventListener only broadcasts after the commit succeeds.' },
  { layer: 'Spring Boot', title: '@Scheduled entropy', where: 'board/ChaosService#decay',
    what: 'A bulk JPQL update drains hype every few seconds, so the board never stands still.' },
  { layer: 'Spring Boot', title: 'Custom Bean Validation', where: 'web/ActuallyBoring.java',
    what: 'A home-made @ActuallyBoring constraint rejects anything that already sounds fun.' },
  { layer: 'Spring Boot', title: 'RFC 9457 Problem Details', where: 'web/ApiExceptionHandler.java',
    what: 'Every error is application/problem+json, with per-field messages the UI shows verbatim.' },
  { layer: 'Spring Boot', title: 'Spring Data JPA + H2', where: 'board/BoringThingRepository.java',
    what: 'Derived queries, a @Modifying bulk update, and an in-memory DB with a web console.' },
  { layer: 'Spring Boot', title: 'Custom argument resolver', where: 'web/PlayerArgumentResolver.java',
    what: 'Controllers just declare a Player parameter; it is built from request headers.' },
  { layer: 'Spring Boot', title: 'Decoupled event listeners', where: 'achievements/AchievementTracker.java',
    what: 'Achievements react to the board’s domain events. The board has no idea achievements exist.' },
  { layer: 'Spring Boot', title: 'Injectable Clock', where: 'achievements/AchievementTrackerTest.java',
    what: 'The 3 a.m. "Insomniac" trophy is tested at noon with a fixed Clock bean.' },
  { layer: 'Angular', title: 'Signal store over SSE', where: 'core/chaos-stream.ts',
    what: 'EventSource events land in signals; computed() keeps the leaderboard sorted for free.' },
  { layer: 'Angular', title: 'Signals for state, Observables for events', where: 'core/chaos-stream.ts',
    what: 'Achievements and waves are Subjects: a signal would swallow two identical events in a row.' },
  { layer: 'Angular', title: 'Functional HTTP interceptor', where: 'core/player.ts',
    what: 'Every /api request gets the player headers, httpResource calls included.' },
  { layer: 'Angular', title: 'Web Crypto', where: 'core/player.ts#tagFor',
    what: 'The browser SHA-256-hashes its own id to recognize its achievements without the server leaking ids.' },
  { layer: 'Angular', title: 'Signal inputs & outputs', where: 'board/thing-card.ts',
    what: 'input.required(), output() and host bindings drive the card, its hype bar and the flash effect.' },
  { layer: 'Angular', title: 'Built-in control flow', where: 'board/board.html',
    what: '@for with track and @empty, @if with aliasing. No structural directive imports.' },
  { layer: 'Angular', title: 'Zoneless + httpResource', where: 'how-it-works/how-it-works.ts',
    what: 'This page loads /actuator/health declaratively; the app runs with no zone.js at all.' },
  { layer: 'Angular', title: 'Lazy routes', where: 'app.routes.ts',
    what: 'This page is a separate chunk loaded with loadComponent the first time you visit it.' },
];

@Component({
  selector: 'app-how-it-works',
  template: `
    <h1>How the chaos is made</h1>
    <p class="health">
      Backend health:
      @if (health.isLoading()) {
        <span class="pill">checking…</span>
      } @else if (health.hasValue()) {
        <span class="pill" [class.up]="health.value().status === 'UP'">{{ health.value().status }}</span>
      } @else {
        <span class="pill down">unreachable. Start it with <code>mvn spring-boot:run</code></span>
      }
      <button (click)="health.reload()">↻</button>
    </p>
    <div class="grid">
      @for (f of features; track f.title) {
        <article [attr.data-layer]="f.layer">
          <small>{{ f.layer }}</small>
          <h3>{{ f.title }}</h3>
          <p>{{ f.what }}</p>
          <code>{{ f.where }}</code>
        </article>
      }
    </div>
  `,
  styles: `
    h1 { font: 800 clamp(1.8rem, 4vw, 2.8rem)/1.1 var(--display); margin: 0 0 1rem; }
    .health { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
    .pill { padding: .2rem .7rem; border-radius: 99px; background: var(--surface-2); font-weight: 700; }
    .pill.up { background: var(--cool); color: #04130c; }
    .pill.down { background: var(--nuclear); color: #fff; }
    .health button { border: 0; background: none; color: inherit; font-size: 1.2rem; cursor: pointer; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: 1rem; }
    article {
      padding: 1.1rem; border-radius: 1.1rem; background: var(--surface);
      border: 2px solid var(--border); box-shadow: 5px 5px 0 var(--shadow);
    }
    article[data-layer='Spring Boot'] small { color: var(--cool); }
    article[data-layer='Angular'] small { color: var(--hot); }
    small { font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
    h3 { margin: .3rem 0; font-family: var(--display); }
    p { margin: 0 0 .6rem; opacity: .85; }
    code { font-size: .78rem; opacity: .65; }
  `,
})
export class HowItWorks {
  protected readonly features = FEATURES;
  protected readonly health = httpResource<{ status: string }>(() => '/actuator/health');
}
