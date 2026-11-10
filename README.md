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

### Or with Docker

```sh
docker compose up --build --wait     # then open http://localhost:8080
```

The production images, as CI builds them:

| Image | Built from | Notes |
|---|---|---|
| `ghcr.io/soulwax/no-boring-backend` | `backend/Dockerfile` | Maven build, Spring Boot layers extracted for cache-friendly pulls, JRE on Alpine, UID 10001, liveness health check |
| `ghcr.io/soulwax/no-boring-frontend` | `frontend/Dockerfile` | Angular build served by unprivileged nginx, which proxies `/api` and `/actuator` (SSE unbuffered) to `BACKEND_URL` |

Only nginx is published in `compose.yaml`; the backend runs read-only on the internal network, as it does
behind Vercel's routing. Set `PORT` to publish elsewhere, or `TAG` to run images pulled from GHCR.

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
| RFC 9457 `ProblemDetail` errors with per-field messages from a `MessageSource` (German default, English) | `web/ApiExceptionHandler.java`, `resources/messages*.properties` |
| Records as DTOs, entity kept internal | `board/ThingView.java`, `web/SubmitRequest.java` |
| Testable randomness (injected `RandomGenerator` supplier) | `twist/TwistEngine.java` |
| Conditional demo data seeding | `board/DemoSeeder.java` |
| Custom `HandlerMethodArgumentResolver`s: controllers just declare a `Player` and a `Lang` | `web/PlayerArgumentResolver.java`, `web/LangArgumentResolver.java` |
| A module that only listens: achievements react to board events via `@EventListener` | `achievements/AchievementTracker.java` |
| Injectable `Clock` so the 3 a.m. trophy is testable at noon | `achievements/AchievementTrackerTest.java` |
| Rich enums as a domain language (genres carry vocabulary, tiers carry thresholds and lore, all in German and English) | `twist/Genre.java`, `board/Tier.java` |
| Language-neutral content: twists and lore are stored as positions in word lists and rendered per SSE client | `i18n/Localized.java`, `twist/Twist.java`, `board/Lore.java` |
| JPA `AttributeConverter`: a `List<String>` of lore keys in one column; an `@Embeddable` record for the twist | `board/LinesConverter.java`, `twist/Twist.java` |
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
| Functional HTTP interceptors adding player headers and `Accept-Language` | `core/player.ts`, `core/i18n.ts` |
| Runtime i18n with signals: a typed DE/EN dictionary, a DE/EN slider kept in `sessionStorage`, translated route titles | `core/i18n.ts`, `core/messages.ts`, `shared/lang-switch.ts` |
| Signals for state, RxJS Subjects for one-off events (toasts, waves) | `core/chaos-stream.ts`, `shared/` |
| Web Crypto SHA-256 to recognize your own broadcasts without leaking ids | `core/player.ts#tagFor` |
| FLIP reorder animation with `afterRenderEffect` | `shared/flip.ts` |
| `effect()` with `onCleanup`: a countdown that only ticks while a mutator runs | `shared/mutator-banner.ts` |
| Tier styling straight from data attributes, incl. an animated `@property` conic border | `board/thing-card.scss` |
| OKLCH design tokens, light/dark themes applied before first paint and swapped with a View Transition | `styles.scss`, `core/color-scheme.ts` |
| Dependency-free SVG icon set and a pure `ago` pipe fed by a ticking signal | `shared/icon.ts`, `shared/ago.ts` |

## API

| Method | Path | Notes |
|---|---|---|
| `GET`  | `/api/things` | Top 50 by hype |
| `POST` | `/api/things` | `{ "original": "…", "author": "…", "genre": "NOIR" }` → `201` + `Location` (genre optional) |
| `POST` | `/api/things/{id}/hype` | +3 hype (×2 during Double Hype); may evolve the thing |
| `POST` | `/api/things/{id}/reroll` | New twist, same boring thing |
| `GET`  | `/api/meter` | `{ level, mood, totalHype, things }` |
| `GET`  | `/api/achievements` | Your trophies (needs `X-Chaos-Player`) |
| `GET`  | `/api/stream` | SSE: `board`, `thing`, `meter`, `presence`, `mutator`, `chronicle`, `activity`, `achievement`, `wave`; `?lang=en` for English |

Optional headers on every call: `X-Chaos-Player` (random id, 8–64 of `[A-Za-z0-9-]`) and
`X-Chaos-Name` (URL-encoded display name). Without them you can play but earn no trophies.

Everything is German unless you ask for English: `Accept-Language: en` or `?lang=en` (the query
parameter wins, since `EventSource` can't set headers; any other language falls back to German).
Twists, lore, moods, mutators, trophies, the chronicle and error messages all follow it; what
players type in stays as typed. In the UI, the DE/EN slider in the top bar switches the tab.

## Deploy

`vercel.json` defines two [Vercel Services](https://vercel.com/docs/services): the Angular build as a static
service and the Spring Boot app as a container built from `backend/Dockerfile.vercel`. `/api/*` and
`/actuator/*` go to the backend, everything else to the frontend.

```sh
vercel deploy --prod
```

Containers scale to zero and may run as several instances, so the in-memory H2 data, trophies and the
SSE room reset on cold starts. Good enough for a demo; see the ideas below for the real fix.

Pushing to `main` deploys automatically through Vercel's Git integration.

## CI

Each repository runs GitHub Actions on every push and pull request:

| Repository | Jobs |
|---|---|
| No-Boring-Backend | **Test**: `mvn verify` on JDK 27. **Image**: build, boot the container until it is healthy, check the API and that it runs as non-root, then push to GHCR from `main` |
| No-Boring-Frontend | **Test**: unit tests and a production build on Node from `.node-version`. **Image**: build, smoke-test nginx (app shell, SPA fallback, security headers), then push to GHCR from `main` |
| No-Boring-Java-Angular | **Compose stack**: builds the pinned submodules, starts the stack and tests it end to end through nginx (health, API, an unbuffered SSE stream, a validated submission). **Terraform**: `fmt`, `init`, `validate` |

Dependabot keeps actions, base images, Maven and npm dependencies current, and opens pull requests here
whenever a submodule moves.

## Infrastructure as code

`infra/terraform` describes the platform this project runs on: the three GitHub repositories (settings,
topics, vulnerability alerts, and branch protection that requires signed commits, linear history and green CI)
and the Vercel project. Everything already existed, so import blocks adopt it on the first apply.

```sh
cd infra/terraform
export GITHUB_TOKEN=$(gh auth token) VERCEL_API_TOKEN=<token from vercel.com/account/tokens>
terraform init
terraform plan     # 4 to import, 6 to add, 3 to change, 0 to destroy
terraform apply
```

State is local and git-ignored. For a team, add a remote backend (an HCP Terraform workspace or an S3
bucket) to `versions.tf` before the first apply.

## Ideas to make it even less boring

- Swap the in-memory broadcaster for Redis pub/sub so multiple backend instances share one room
- Add rooms (`/api/rooms/{code}/stream`) for party-game mode
- Let an LLM write the twists instead of the combinatorial engine
- Persist trophy progress (it is in memory today)
