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

### The rules of the room

- **Genres.** Every twist has a flavor: 🎪 Classic, 🕵️ Noir, 🚀 Space Opera, 🦁 Nature Doc, 🏰 Medieval or
  💎 Heist. Pick one or let the dice decide. Re-rolls stay in genre.
- **Evolution.** Hype pushes a thing up the ladder: 😐 Boring → 🤨 Curious (6) → 🌶️ Spicy (15) →
  👑 Legendary (30) → 🐉 Mythic (50). Each tier reached for the first time writes a line of **lore** into
  its story (*"The Moon files a noise complaint."*). Hype decays; peak tier and lore never do.
- **Mutators.** Every 90 s, and instantly after a Chaos Wave, the room's rules bend for 45 s:
  ⚡ Double Hype, 🧊 Frozen Time (no decay), 🎬 Genre Lock (every new twist is forced into one genre) or
  🌀 Twist Tornado (every hype re-rolls the twist).
- **The Chronicle.** A live feed of the room's story: submissions, evolutions, waves, mutators. Late
  joiners get the last 20 entries.

| Layer    | Stack                                                       |
|----------|-------------------------------------------------------------|
| Backend  | Spring Boot 4.1 · Java 27 · Spring MVC · Data JPA · H2 · Actuator |
| Frontend | Angular 22 (zoneless, standalone, signals) · Vitest         |
| Realtime | Server-Sent Events (`SseEmitter` → `EventSource`)           |

## Run it

`backend/` and `frontend/` are submodules ([No-Boring-Backend](https://github.com/soulwax/No-Boring-Backend), [No-Boring-Frontend](https://github.com/soulwax/No-Boring-Frontend)), so clone with
`git clone --recurse-submodules git@github.com:soulwax/No-Boring-Java-Angular.git`, or run `git submodule update --init` in an existing clone.

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
| Rich enums as a domain language (genres carry vocabulary, tiers carry thresholds and lore) | `twist/Genre.java`, `board/Tier.java` |
| JPA `AttributeConverter`: a `List<String>` of lore in one column | `board/LinesConverter.java` |
| Lock-free timed state: `AtomicReference` + two `@Scheduled` jobs | `mutator/MutatorDirector.java` |
| A read model built from domain events, with a ring buffer for late joiners | `live/Chronicle.java` |

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
| FLIP reorder animation with `afterRenderEffect` | `shared/flip.ts` |
| `effect()` with `onCleanup`: a countdown that only ticks while a mutator runs | `shared/mutator-banner.ts` |
| Tier styling straight from data attributes, incl. an animated `@property` conic border | `board/thing-card.scss` |

## API

| Method | Path | Notes |
|---|---|---|
| `GET`  | `/api/things` | Top 50 by hype |
| `POST` | `/api/things` | `{ "original": "…", "author": "…", "genre": "NOIR" }` → `201` + `Location` (genre optional) |
| `POST` | `/api/things/{id}/hype` | +3 hype (×2 during Double Hype); may evolve the thing |
| `POST` | `/api/things/{id}/reroll` | New twist, same boring thing |
| `GET`  | `/api/meter` | `{ level, mood, totalHype, things }` |
| `GET`  | `/api/achievements` | Your trophies (needs `X-Chaos-Player`) |
| `GET`  | `/api/stream` | SSE: `board`, `thing`, `meter`, `presence`, `mutator`, `chronicle`, `activity`, `achievement`, `wave` |

Optional headers on every call: `X-Chaos-Player` (random id, 8–64 of `[A-Za-z0-9-]`) and
`X-Chaos-Name` (URL-encoded display name). Without them you can play but earn no trophies.

## Deploy

`vercel.json` defines two [Vercel Services](https://vercel.com/docs/services): the Angular build as a static
service and the Spring Boot app as a container built from `backend/Dockerfile.vercel`. `/api/*` and
`/actuator/*` go to the backend, everything else to the frontend.

```sh
vercel deploy --prod
```

Containers scale to zero and may run as several instances, so the in-memory H2 data, trophies and the
SSE room reset on cold starts. Good enough for a demo; see the ideas below for the real fix.

## Ideas to make it even less boring

- Swap the in-memory broadcaster for Redis pub/sub so multiple backend instances share one room
- Add rooms (`/api/rooms/{code}/stream`) for party-game mode
- Let an LLM write the twists instead of the combinatorial engine
- Persist trophy progress (it is in memory today)
