# Opposite of Boring 💥

A live, multiplayer **Boredom Annihilator**. Submit something boring ("filing my taxes"), and the
Twist Engine turns it into something nobody could be bored by:

> *Filing my taxes in a haunted Victorian mansion, while a golden retriever supervises. Win and you become mayor.*

Everyone connected sees new twists appear in real time. Hit 🔥 to hype a twist, or 🎲 to re-roll it.
Hype **decays** on its own every few seconds, so the leaderboard never stands still. The **Chaos Meter**
tracks the room's total energy. Push it past 70 and the meter starts to wobble. Push it past 85 and a
**Chaos Wave** rains emoji down every connected screen, credited to whoever tipped it over.

Along the way you earn **trophies** (Shameless, Insomniac, Wave Rider, …). Every unlock is announced to the
whole room as a toast; your shelf lives on the Trophies page.

| Layer    | Stack                                                       |
|----------|-------------------------------------------------------------|
| Backend  | Spring Boot 4.1 · Java 27 · Spring MVC · Data JPA · H2 · Actuator |
| Frontend | Angular 22 (zoneless, standalone, signals) · Vitest         |
| Realtime | Server-Sent Events (`SseEmitter` → `EventSource`)           |

## Run it

Prerequisites (via scoop + fnm): `scoop install maven oraclejdk fnm`, then `fnm install 26.12.1`.

```sh
# terminal 1 – backend on :8080
cd backend
mvn spring-boot:run

# terminal 2 – frontend on :4200 (proxies /api and /actuator to :8080)
cd frontend
fnm use            # picks up .node-version (26.12.1)
npm install
npm start
```

Open <http://localhost:4200> in **two browser windows** side by side and watch them stay in sync.

Extras: H2 console at <http://localhost:8080/h2-console> (JDBC URL `jdbc:h2:mem:chaos`, user `sa`),
health at <http://localhost:8080/actuator/health>.

## Tests

```sh
cd backend  && mvn test                       # TwistEngine unit tests + full MockMvc API tests
cd frontend && npx ng test --watch=false      # signal store, gauge component, app shell
```

## What it demonstrates

### Spring Boot (`backend/src/main/java/dev/oob/chaos`)

| Concept | Where |
|---|---|
| SSE fan-out to every open tab, with heartbeats and dead-client cleanup | `live/ChaosBroadcaster.java` |
| Domain events published in a transaction, broadcast **after commit** via `@TransactionalEventListener` | `board/ChaosService.java`, `live/ChaosEvent.java` |
| `@Scheduled` entropy job using a `@Modifying` JPQL bulk update with `CASE` | `board/ChaosService#decay`, `board/BoringThingRepository.java` |
| Custom Bean Validation constraint (`@ActuallyBoring` rejects fun things) | `web/ActuallyBoring.java`, `web/ActuallyBoringValidator.java` |
| RFC 9457 `ProblemDetail` errors with per-field messages | `web/ApiExceptionHandler.java` |
| Records as DTOs, entity kept internal | `board/ThingView.java`, `web/SubmitRequest.java` |
| Testable randomness (injected `RandomGenerator` supplier) | `twist/TwistEngine.java` |
| Conditional demo data seeding | `board/DemoSeeder.java` |
| Custom `HandlerMethodArgumentResolver`: controllers just declare a `Player` | `web/PlayerArgumentResolver.java` |
| A module that only listens: achievements react to board events via `@EventListener` | `achievements/AchievementTracker.java` |
| Injectable `Clock` so the 3 a.m. trophy is testable at noon | `achievements/AchievementTrackerTest.java` |

### Angular (`frontend/src/app`)

| Concept | Where |
|---|---|
| Signal store fed by `EventSource`; `computed()` keeps the leaderboard sorted | `core/chaos-stream.ts` |
| Instant local updates: REST responses are folded into the store before the SSE echo arrives | `core/chaos-api.ts` |
| Signal `input()`/`output()`, host bindings, CSS custom properties from signals | `board/thing-card.ts` |
| Animated SVG gauge driven purely by inputs | `board/chaos-meter.ts` |
| Signal-based form with `effect()`s (persisted name, auto-clearing errors), ProblemDetail rendering | `board/submit-form.ts` |
| Built-in control flow (`@for … track … @empty`, `@if … as`) | `board/board.html` |
| `httpResource` + lazy-loaded route | `how-it-works/how-it-works.ts`, `app.routes.ts` |
| Dev proxy instead of CORS | `proxy.conf.json` |
| Functional HTTP interceptor adding player headers | `core/player.ts` |
| Signals for state, RxJS Subjects for one-off events (toasts, waves) | `core/chaos-stream.ts`, `shared/` |
| Web Crypto SHA-256 to recognize your own broadcasts without leaking ids | `core/player.ts#tagFor` |

## API

| Method | Path | Notes |
|---|---|---|
| `GET`  | `/api/things` | Top 50 by hype |
| `POST` | `/api/things` | `{ "original": "…", "author": "…" }` → `201` + `Location` |
| `POST` | `/api/things/{id}/hype` | +3 hype |
| `POST` | `/api/things/{id}/reroll` | New twist, same boring thing |
| `GET`  | `/api/meter` | `{ level, mood, totalHype, things }` |
| `GET`  | `/api/achievements` | Your trophies (needs `X-Chaos-Player`) |
| `GET`  | `/api/stream` | SSE: `board`, `thing`, `meter`, `presence`, `achievement`, `wave` events |

Optional headers on every call: `X-Chaos-Player` (random id, 8–64 of `[A-Za-z0-9-]`) and
`X-Chaos-Name` (URL-encoded display name). Without them you can play but earn no trophies.

## Ideas to make it even less boring

- Swap the in-memory broadcaster for Redis pub/sub so multiple backend instances share one room
- Add rooms (`/api/rooms/{code}/stream`) for party-game mode
- Let an LLM write the twists instead of the combinatorial engine
- Persist trophy progress (it is in memory today)
