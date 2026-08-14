# IELPS Canonical Manifest

Revision 3 — 2026-08-14. Supersedes revisions 1 and 2 of the same date.

Written to satisfy sections 13 and 16 of *IELPS Developer Handoff — Canonical UI,
Access Panel & Backend Integration Rules*, and corrected against the client's
instructions of 2026-08-14.

Revision 3 corrects the landing-page approval history only. The 11 August 2026
morning and afternoon landing conversations are recorded as two separate events
(§1 LANDING_CANONICAL), and the statement that `IELPS-new-landing-page` was
never approved is withdrawn.

Approval categories are kept separate throughout: **UI APPROVED**,
**FUNCTION APPROVED**, **DEPLOY APPROVED**. One never implies another.

Where something is not connected it is marked **NOT WIRED**, **NOT TESTED**,
**PROVIDER NOT CONFIGURED** or **CANONICAL SOURCE NOT FOUND**. Nothing is
omitted from the architecture because it is absent from the current build or
difficult to connect.

---

## 0. Terminology — the Access Panel is not the public front page

This is settled and is not an open question.

| | Component | Address | What it is |
| --- | --- | --- | --- |
| 1 | **Public Landing / front page** | `https://eilps.com/` | The separately approved public entry to IELPS. A canonical component in its own right. |
| 2 | **Access Panel home** | `/learner/` | The application / pathway entry screen. It sits **behind** the public landing and onboarding flow. It is **not** the public front page. |
| 3 | **Access Panel pathway screens** | `/learner/app/…` | The 50+ approved frontend shells that mirror the backend architecture. |

Architecture:

**Public Landing → onboarding / gateway / placement where applicable → Access
Panel → pathway screens → Lesson Player / Discover / other functions → backend.**

Any earlier message, filename, release or note in this project that calls
`/learner/`, the Access Panel, or a learner dashboard the "front page" is
**historical terminology from the earlier miscommunication**, not an
architectural decision. The approved public landing pages from before that
confusion remain the public front-page source of truth, subject only to changes
the client later approved specifically as public-landing changes — of which the
11 August afternoon `hero-banner` work is one. See §1 LANDING_CANONICAL.

This terminology correction does **not** alter the landing-page history. The
Access Panel is a separate component behind the public landing, and it was the
next piece of work **after** the public landing was approved on 11 August.

---

## 1. Manifest

### LANDING_CANONICAL — public front page

**11 August 2026 produced two separate landing-page events, morning and
afternoon. They are not the same approval and must not be combined.** Corrected
2026-08-14 on the client's instruction; this chronology is **resolved**, not an
open interpretation.

#### (a) 11 Aug 2026, MORNING — `LANDING PAGE 2.html` / Pearson Canada
- Status: **CANONICAL REFERENCE / RESTORED BASELINE**
- Explicitly **not** the final UI approval of that day.
- Source: the client's own attachment `LANDING PAGE 2.html`, identical (md5 `c19cc9a4481a94d290510a54b5e82b8e`) to `04-pearson-canada-colour-only-offline-standalone-preview.html`, title `IELPS-Pearson-Canada-Colour-Only-2026-08-02`
- Sent because he could not see the image attachment under discussion. He described the attached HTML as the "one true canonical correct landing/front page" and instructed a restoration to it. He chose Page 2 over Page 1 because it matched the Pearson Canada colour direction.
- Lives as: `frontend/src/landing-markup.html` (11,158 bytes) + `frontend/src/landing.css` (52,106 bytes), injected by `Login.jsx`
- **DEPLOYED** 2026-08-11 and **still what `eilps.com/` serves today.**
- Verified 2026-08-14: the live page renders identically to his preview file at 1280 wide.
- He did not say "I approve this as the final landing page" after the restoration; shortly afterwards he stopped further work so the landing, hero sections and what sits behind them could be resolved properly.

#### (b) 11 Aug 2026, AFTERNOON — `IELPS-new-landing-page` / `hero-banner`
- Status: **UI APPROVED**
- Approval statement: **"Anirudha, this is perfect. My exact vision."**
- Source: repo `10495109/IELPS-new-landing-page`, branch **`hero-banner`**, head `a6e1cf1e`
- He deliberately reset the landing-page work onto GitHub — "This is the new landing page we need to get right before we do anything else" and "Ignore everything here. We will work on the Landing page on GitHub: IELPS-new-landing-page." That instruction **superseded the morning restoration as the active landing-page design work.**
- What was built and reviewed there: the photograph became the full hero background; existing structure and content retained; the woman enlarged and brought forward; head and hands kept in frame; the other photographic banner sections converted to the same full-background hero treatment.
- Commit record on `hero-banner`, all 2026-08-11 afternoon UTC, corroborating the chronology:
  - `1fec2ff9` 13:58 — hero: make the photograph the full hero banner
  - `146a85c6` 14:57 — banners: every section photograph becomes a full hero background
  - `a6e1cf1e` 15:51 — hero: push the subject up so both hands are in frame
- Held on `hero-banner`, **not** pushed to `main`, because merges to `main` auto-deploy via v0.
- Immediately after the approval the conversation moved to "Next thing is the Access Panel" — which is why the approval attaches to this landing work and not to the Access Panel, and not retrospectively to the morning restoration.
- **NOT DEPLOY APPROVED.** UI APPROVED never implies DEPLOY APPROVED.

#### Consequence to be aware of
The design carrying the explicit UI approval (b) is **not** the design currently
served at `eilps.com/`; production still serves the morning restored baseline
(a). That is correct under the approval rules — no deploy approval has been
given — but it means the public front page and the approved landing design are
presently two different things. Closing that gap requires **DEPLOY APPROVED**
for `hero-banner`, and it is not to be done before then.

Superseded record: an earlier revision of this manifest, and the August landing
summary sent 2026-08-14, recorded the morning file as UI APPROVED on 2026-08-11
and stated that `IELPS-new-landing-page` was never approved. **Both statements
are withdrawn as incorrect.**

### GATEWAY_CANONICAL — signed-out gate
- Source: `frontend/src/SignInRequired.jsx` + `frontend/src/gated-routes.js`
- **FUNCTION APPROVED** 2026-08-13 (Option 2) · live since 2026-08-13 20:57, 20 routes
- Account types on each locked door are computed from `ACCOUNT_PATHWAYS[].allowedRoutes`, never hand-typed.

### PLACEMENT_CANONICAL
- Placement is required for **learners**: adult learners, junior learners, children registered by parents, and children onboarded into schools and classrooms.
- Teachers and school administrators **do not** take a placement test themselves. School and classroom onboarding must not bypass learner placement — the learner profiles entering those classrooms still follow the placement / level-allocation process.
- Agreed learner funnel: **Landing → free placement → immediate CEFR/skill result → personal recommendation → $3 first-lesson learning plan → membership / ongoing learning**
- Backend exists: `GET /api/assessment/level-check`, `POST /api/assessment/level-check/score`, `POST /api/assessment/placement/calibrate`
- Frontend exists: `frontend/src/screens/Diagnostic.jsx` on the main site
- Status: **NOT WIRED as a funnel.** The pieces exist separately. The landing currently goes straight to the Access Panel, and the Access Panel does not route a new learner through placement before a pathway. Sequencing them is outstanding work, not a missing component.

### ACCESS_PANEL_CANONICAL
- Repo `10495109/v0-ielps-platform-h4`, branch `access-panel-approved-design`, commit at time of writing `ba27fbd`
- Parent (repo as received): `c3131a4`
- **UI APPROVED** 2026-08-12 for the hero and cards. Those corrections had existed only as hand edits on deployed HTML; they are now in the repo source so a rebuild cannot revert them.
- **NOT DEPLOY APPROVED.** Staged and under review at `https://eilps.com/learner/panel-preview/`
- Not pushed to `main`: the repo README states merges to `main` auto-deploy via v0.

### PATHWAYS_CANONICAL
- `lib/apps/*.ts` in the repo above, plus the client's `PATHWAYS.zip` wiring map (2026-08-12)
- 7 account pathways, 31 screens, 7 onboarding flows. **FUNCTION APPROVED** 2026-08-12.
- Pathway card titles come from `GET /api/auth/pathways` (`label`). Server data, never hand-typed. **Confirmed by the client 2026-08-14.**

### LESSON_PLAYER_CANONICAL — resolved
- The canonical lesson experience is the approved **15-step IELPS A1–C2 Lesson Player**, with the verified backend wiring applied to it.
- Canonical route: **`/learner?lesson=:lessonId`**
- `/learner/lesson` is preserved as an **alias/redirect** for backwards compatibility. It is an approved part of the architecture, not a legacy page.
- The adapter must use the real live backend routes — in particular `GET /api/curriculum/deep-catalog` — and must not create duplicate backend routes to match an older specification.
- The pathway lesson-entry screens must connect **into** this canonical lesson experience. They must not become a competing lesson-player architecture.
- Current state: the pathway lesson entries at `/learner/app/<pathway>/learner` render and call `deep-catalog` and the resources endpoint, but the canonical `?lesson=` route is **NOT WIRED** yet, and the 15 steps are **not yet reconciled** against the 2026-08-10 wiring specification (lesson data, outcomes, vocabulary, activities, review, AI coach, pronunciation, audio, writing, assessment, progress, rewards).

### DISCOVER_CANONICAL — resolved
- **One** canonical Discover experience: the approved frontend design wired to the real Discovery backend. Not a choice between an old and a new product.
- Canonical route: **`/discover`**. `/learner/discover` preserved as an alias/redirect.
- Backend: `GET /api/discovery/catalogue` — returns 200 live.
- Current state: the deployed `/learner/discover` reads a curriculum file baked in at build time and makes **no API call**. The Access Panel's Discover screen does call the real endpoint. Reconciling the approved Discover UI onto the real backend is outstanding work.

### LEVEL_BAND_CANONICAL — ported 2026-08-14
- `components/level-band.tsx` in the Access Panel repo, mounted on the panel home.
- **FUNCTION APPROVED** 2026-08-13, live since then on the r4 release. It was built there and not in this repo, so a swap would have lost it. Now moved, as instructed.
- Rules preserved: with no `?level=` in the address it renders **nothing**, so the approved page is untouched — verified, document height 5017 with and without the band absent. Every figure is read from `GET /api/curriculum/deep-catalog` at run time, not counted at build time, so it cannot drift from the server.
- ⚠️ One deliberate change from the r4 version: the level title now comes from the live catalogue (`C1 Advanced English for Academic, Professional and Civic Impact`) rather than a build-time copy (`Advanced: Academic and Professional English`). Server data over a local copy, per the pathway-title decision.
- Its "Start the first C1 lesson" button points at `/learner/lesson?level=C1` — the route that works today. It moves to `/learner?lesson=:lessonId` when that route is built.

### PALETTE_CANONICAL — resolved
- `#0D004D` deep navy · `#512EAB` primary purple · `#3860BE` learning blue · **`#22C7C6` turquoise** · `#FFCE00` gold
- Turquoise **is** canonical. The earlier shortened list that omitted it was incomplete. Confirmed by the client 2026-08-14; the build already uses `#22C7C6`.
- Rejected peach/orange systems must not be reintroduced.

### ANALYTICS_CANONICAL
- `@vercel/analytics` is an intended frontend dependency and is **not to be deleted**. See section 2, "Analytics", for where it is mounted, why the request fails on this server, and what configuration would satisfy it.

### BACKEND_CANONICAL
- The existing IELPS API on the client's server. 31 mounted route modules (`~/eilps/backend/src/index.js`). No backend route was added, renamed or loosened.

### CURRENT_PRODUCTION_RELEASE
- Public site: `~/eilps/frontend/dist`, build manifest `sourceSha256 00b909f5…`, generated 2026-08-13T20:55:39Z, port 4301
- Access Panel: `~/eilps/releases/ielps-a1-c2-learner-20260805-r4-discovery/out`, port 4302
- Review copy: same release directory, `out/panel-preview/`, reachable at `/learner/panel-preview/`. Additive only — no existing file changed, no service restarted.
- Rollback retained: `~/eilps/frontend/dist.rollback-gate-20260813T205527Z`

### LAST_APPROVED_BUILD
- Public site: the 2026-08-13 gate build. **DEPLOY APPROVED**, live. It carries the 11 Aug morning restored landing baseline, not the UI APPROVED `hero-banner` design.
- Public landing design: `IELPS-new-landing-page` @ `hero-banner` `a6e1cf1e`. **UI APPROVED**, never built or deployed.
- Access Panel: none. The h4 build awaits **DEPLOY APPROVED**.

---

## 2. Architecture coverage register

Every stage of the IELPS architecture, whether or not it appears in the staged
build. Status is evidence-based, measured on 2026-08-14 against the live server.

| # | Architecture stage | Backend module(s) | Frontend | Status |
| --- | --- | --- | --- | --- |
| 1 | Public landing — restored baseline (11 Aug AM) | — | `landing-markup.html` | ✅ LIVE, unchanged. Canonical reference / restored baseline, **not** the final UI approval |
| 1b | Public landing — UI APPROVED design (11 Aug PM) | — | repo `IELPS-new-landing-page`, branch `hero-banner` @ `a6e1cf1e` | ✅ **UI APPROVED** ("this is perfect. My exact vision.") · ⚠️ **NOT DEPLOYED**, awaiting DEPLOY APPROVED |
| 2 | Gateway / funnel (signed-out gate) | `auth` | `SignInRequired.jsx` | ✅ LIVE, 20 routes |
| 3 | Placement | `assessment` (`/level-check`, `/level-check/score`, `/placement/calibrate`) | `Diagnostic.jsx` | ⚠️ **NOT WIRED as a funnel** — components exist, sequence does not |
| 4 | Result / recommendation | `assessment`, `engine` | — | ⚠️ **NOT WIRED** — no screen consumes the placement result into a recommendation |
| 5 | Account / activation | `auth` (`/register`, `/student-login`, `/oauth/:provider`, `/mfa`) | Access Panel onboarding ×7 | ✅ WIRED — all 7 onboarding screens render; registration verified live for 6 pathways |
| 6 | $3 first-lesson learning plan | `billing` — `TRIAL_PRICE_CENTS = 300`, `trial_purchases` table | — | ⚠️ **PROVIDER NOT CONFIGURED** — no Stripe keys or price IDs in the backend environment; checkout fails closed by design |
| 7 | Access Panel | — | `/learner/` | ✅ BUILT + STAGED |
| 8 | All pathways (7) | `auth/pathways` | `lib/apps/*.ts` | ✅ WIRED — titles read from the server |
| 9 | Onboarding (7 flows) | `auth` | 7 screens | ✅ RENDERS — form submission not yet exercised end to end |
| 10 | Dashboards (7) | `school`, `progress`, `engine`, `tutoring`, `authoring` | 7 screens | ✅ WIRED + signed-in tested |
| 11 | Curriculum | `curriculum` (`/deep-catalog`) | 10 screens | ✅ WIRED — 200 signed out and signed in |
| 12 | Lesson Player (15 steps) | `curriculum`, `progress`, `activities`, `assessment`, `lesson-support`, `review`, `agent` | 15-step player | ⚠️ **NOT RECONCILED** against the 2026-08-10 wiring specification |
| 13 | Adaptive activities | `activities`, `engine` | player + review screens | ⚠️ PARTIAL — `/api/activities/moderation` verified; learner submission path not exercised |
| 14 | Audio | `agent` TTS, `content-assets` | player, Pip | ⚠️ PARTIAL — cached audio serves; **dynamic speech is off**, see section 5 item 2 |
| 15 | AI / speaking / pronunciation | `ai_provider`, `agent`, `ai_moderation` | Pip, coach | ⚠️ **PROVIDER NOT CONFIGURED** — no AI provider key present in the backend environment |
| 16 | Smart Review | `review`, `engine/review-queue` | review screens | ⚠️ ENTITLEMENT-GATED — `/api/review/due` returns **402** on a free account; `/api/engine/review-queue` returns 200 |
| 17 | Progress | `progress`, `engine/mastery` | 4 screens | ✅ WIRED + signed-in tested |
| 18 | Rewards / gamification | `gamification` | junior screens | ✅ WIRED + signed-in tested |
| 19 | Reports | `school` (`/classes/:id/report`, `/export`) | teacher + parent screens | ⚠️ **NOT WIRED** — declared on the panel, never called; needs a class id resolver |
| 20 | Certificates | `certificates` | progress screen | ✅ WIRED — eligibility endpoint returns 200 signed in |
| 21 | Discover | `discovery` | Discover screens | ⚠️ SPLIT — see `DISCOVER_CANONICAL` |
| 22 | Tutoring | `tutoring`, `tutor`, `classroom` | 4 tutor screens + directory | ✅ WIRED + signed-in tested |
| 23 | Parent | `school/parent/*` | 4 screens | ✅ WIRED + signed-in tested |
| 24 | Teacher | `school` | 4 screens | ⚠️ PARTIAL — dashboard wired; classes, assignments and reports **NOT WIRED** |
| 25 | School / classroom | `school`, `roster`, `classroom` | 4 screens | ✅ WIRED + signed-in tested; roster import and class-code login verified |
| 26 | Studio / authoring | `authoring`, `studio/coursebook`, `studio/ai` | 5 screens | ⚠️ PARTIAL — 5 of 6 governance endpoints answer; generations **NOT WIRED** |
| 27 | Payments / entitlements | `billing`, `entitlements`, `payments` | billing + licences screens | ⚠️ **PROVIDER NOT CONFIGURED** — plans and subscription read fine; no checkout possible |
| 28 | Permissions / security | `auth`, `entitlements`, per-route guards | all | ✅ VERIFIED both ways — see section 4 |

### Analytics — the `@vercel/analytics` question

Checked in the source rather than assumed, because the two codebases differ:

- **`/learner/lesson` and `/learner/discover`** (release r4): the source at
  `learner_exp_unpack/app/layout.tsx` line 25 does deliberately mount
  `{process.env.NODE_ENV === 'production' && <Analytics />}`. The client is
  correct about this file.
- **The Access Panel repo (h4)**: `@vercel/analytics` is in `package.json`, but
  `grep -rn "Analytics" app/ components/` returns nothing — no layout or
  component mounts it. That is why the new build emits no reference to it
  (`grep -rl _vercel/insights out/` → 0 files). Nothing was removed.

**Why the request fails on this deployment.** `<Analytics />` requests
`/_vercel/insights/script.js` from its own origin. That path is served by
Vercel's edge network, not by the application. On `eilps.com` nginx has no such
location, so `location /` falls through to the platform server, which answers
with HTML and a 200. The browser then parses HTML as JavaScript and logs
`Unexpected token '<'`.

**What would satisfy it.** The package exposes `scriptSrc`, `endpoint`, `dsn`
and `beforeSend` props precisely for hosting outside Vercel. Reconciling it is a
configuration task with three parts:
1. serve `/_vercel/insights/script.js`, or set `scriptSrc` to a copy of
   `https://va.vercel-scripts.com/v1/script.js` hosted on this domain;
2. point `endpoint` at a collector that will accept the beacons;
3. decide where the data is meant to land — Vercel Web Analytics itself expects
   a Vercel project, so off-Vercel the collector has to be chosen.

Nothing is to be deleted. This is recorded as **PROVIDER NOT CONFIGURED**.

---

## 3. Route reconciliation

| Purpose | Canonical route | Current state | Action |
| --- | --- | --- | --- |
| Lesson flow | `/learner?lesson=:lessonId` | not implemented | **NOT WIRED** — to build |
| Lesson flow (legacy) | `/learner/lesson` | live, 200 | keep as alias/redirect |
| Discover | `/discover` | not implemented | **NOT WIRED** — to build |
| Discover (legacy) | `/learner/discover` | live, 200 | keep as alias/redirect |
| Access Panel home | `/learner/` | live, 200 | unchanged |
| Junior entry | `/student-login` | backend route exists (`POST /api/auth/student-login`, verified working) | **page missing** — frontend screen not built |
| Parent signup | `/signup/parent` | backend verified | page missing |
| Teacher signup | `/signup/teacher` | backend verified | page missing |

---

## 4. Integration matrix

All 57 Access Panel routes. Endpoints are **not** copied from a specification —
they are the requests each page actually issued in a browser on 2026-08-14
against the live server, with the status the server returned.

Two separate tests are recorded, as required:

- **Signed-out security test** — the page loaded with no session. `401` is the
  correct answer for a protected endpoint and is the proof that permissions are
  enforced. This column proves security, not function.
- **Signed-in functional / data test** — the same page loaded with a real
  session for that pathway's role. `200` means the real response rendered.
  `402` means an entitlement is required, `403` means a higher role is required;
  both are correct behaviour, not faults.

Legend: ✅ 200 · 💳 402 entitlement required · 🔒 403 role required ·
⚠️ NOT WIRED (declared on the panel, never called).

Totals across all 57 routes, signed in: **200 × 47, 402 × 3, 403 × 1**, plus the
junior classroom session, and **0 page errors** anywhere.

| Screen | Route | Role | Canonical UI | Endpoints called | Signed-out security test | Signed-in functional / data test |
| --- | --- | --- | --- | --- | --- | --- |
| Access Panel home | /learner/panel-preview/ | All (public) | UI APPROVED 12 Aug | `GET /api/auth/pathways` | ✅ 200 | ✅ 200 × 1 |
| Junior Learners — pathway entry | /learner/panel-preview/app/junior | Under-12 learner | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
| Junior Learners — My Home | /learner/panel-preview/app/junior/dashboard | Under-12 learner | Approved shell | `GET /api/curriculum/deep-catalog`<br>`GET /api/gamification/profile`<br>`GET /api/progress` | ✅ 200 / 401 | ✅ 200 × 3 |
| Junior Learners — Lessons | /learner/panel-preview/app/junior/lessons | Under-12 learner | Approved shell | `GET /api/curriculum/deep-catalog` | ✅ 200 | ✅ 200 × 1 |
| Junior Learners — Games | /learner/panel-preview/app/junior/games | Under-12 learner | Approved shell | `GET /api/practice/next`<br>`GET /api/review/due` | ✅ 401 | 💳 402 × 2 |
| Junior Learners — Classroom | /learner/panel-preview/app/junior/classroom | Under-12 learner | Approved shell | `GET /api/tutoring/bookings` | ✅ 401 | ✅ 200 × 1 |
| Junior Learners — Progress | /learner/panel-preview/app/junior/progress | Under-12 learner | Approved shell | `GET /api/gamification/leaderboard`<br>`GET /api/progress` | ✅ 401 | ✅ 200 × 2 |
| Junior Learners — onboarding | /learner/panel-preview/app/junior/onboarding | Under-12 learner | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
| Junior Learners — lesson entry | /learner/panel-preview/app/junior/learner | Under-12 learner | Approved lesson player | `GET /api/curriculum/deep-catalog`<br>`GET /api/resources/starfall-splashlearn/lessons/a1d01l1` | ✅ 200 / 401 | ✅ 200 × 2 |
| Adult Scholars & Self-Starters — pathway entry | /learner/panel-preview/app/adult | Self-paced learner | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
| Adult Scholars & Self-Starters — My Course | /learner/panel-preview/app/adult/dashboard | Self-paced learner | Approved shell | `GET /api/curriculum/deep-catalog`<br>`GET /api/engine/schedule`<br>`GET /api/progress` | ✅ 200 / 401 | ✅ 200 × 3 |
| Adult Scholars & Self-Starters — Lesson Player | /learner/panel-preview/app/adult/player | Self-paced learner | Approved shell | `GET /api/engine/next` | ✅ 401 | ✅ 200 × 1 |
| Adult Scholars & Self-Starters — Discover | /learner/panel-preview/app/adult/discover | Self-paced learner | Approved shell | `GET /api/discovery/catalogue` | ✅ 200 | ✅ 200 × 1 |
| Adult Scholars & Self-Starters — Review | /learner/panel-preview/app/adult/review | Self-paced learner | Approved shell | `GET /api/engine/review-queue`<br>`GET /api/practice/filters`<br>`GET /api/review/due` | ✅ 401 | ✅ 200 × 1<br>💳 402 × 2 |
| Adult Scholars & Self-Starters — Progress | /learner/panel-preview/app/adult/progress | Self-paced learner | Approved shell | `GET /api/certificates/eligibility/B1`<br>`GET /api/engine/mastery` | ✅ 401 | ✅ 200 × 2 |
| Adult Scholars & Self-Starters — onboarding | /learner/panel-preview/app/adult/onboarding | Self-paced learner | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
| Adult Scholars & Self-Starters — lesson entry | /learner/panel-preview/app/adult/learner | Self-paced learner | Approved lesson player | `GET /api/curriculum/deep-catalog`<br>`GET /api/resources/starfall-splashlearn/lessons/a1d01l1` | ✅ 200 / 401 | ✅ 200 × 2 |
| Parents & Guardians — pathway entry | /learner/panel-preview/app/parents | Family account | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
| Parents & Guardians — Overview | /learner/panel-preview/app/parents/dashboard | Family account | Approved shell | `GET /api/school/parent/dashboard` | ✅ 401 | ✅ 200 × 1 |
| Parents & Guardians — Access & links | /learner/panel-preview/app/parents/links | Family account | Approved shell | `GET /api/school/parent/dashboard` | ✅ 401 | ✅ 200 × 1 |
| Parents & Guardians — Reports | /learner/panel-preview/app/parents/reports | Family account | Approved shell | `GET /api/progress` | ✅ 401 | ✅ 200 × 1 |
| Parents & Guardians — Billing | /learner/panel-preview/app/parents/billing | Family account | Approved shell | `GET /api/billing/plans`<br>`GET /api/billing/subscription` | ✅ 200 / 401 | ✅ 200 × 2 |
| Parents & Guardians — onboarding | /learner/panel-preview/app/parents/onboarding | Family account | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
| Parents & Guardians — lesson entry | /learner/panel-preview/app/parents/learner | Family account | Approved lesson player | `GET /api/curriculum/deep-catalog`<br>`GET /api/resources/starfall-splashlearn/lessons/a1d01l1` | ✅ 200 / 401 | ✅ 200 × 2 |
| Educators & Classroom Teachers — pathway entry | /learner/panel-preview/app/teachers | Classroom teacher | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
| Educators & Classroom Teachers — Overview | /learner/panel-preview/app/teachers/dashboard | Classroom teacher | Approved shell | `GET /api/school/classes`<br>`GET /api/school/dashboard` | ✅ 401 | ✅ 200 × 2 |
| Educators & Classroom Teachers — Classes | /learner/panel-preview/app/teachers/classes | Classroom teacher | Approved shell | _session only_ | ✅ 401 on session | ⚠️ NOT WIRED |
| Educators & Classroom Teachers — Assignments | /learner/panel-preview/app/teachers/assignments | Classroom teacher | Approved shell | _session only_ | ✅ 401 on session | ⚠️ NOT WIRED |
| Educators & Classroom Teachers — Reports | /learner/panel-preview/app/teachers/reports | Classroom teacher | Approved shell | _session only_ | ✅ 401 on session | ⚠️ NOT WIRED |
| Educators & Classroom Teachers — onboarding | /learner/panel-preview/app/teachers/onboarding | Classroom teacher | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
| Educators & Classroom Teachers — lesson entry | /learner/panel-preview/app/teachers/learner | Classroom teacher | Approved lesson player | `GET /api/curriculum/deep-catalog`<br>`GET /api/resources/starfall-splashlearn/lessons/a1d01l1` | ✅ 200 / 401 | ✅ 200 × 2 |
| Online & Live Tutors — pathway entry | /learner/panel-preview/app/tutors | Verified tutor | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
| Online & Live Tutors — Overview | /learner/panel-preview/app/tutors/dashboard | Verified tutor | Approved shell | `GET /api/tutoring/application`<br>`GET /api/tutoring/bookings` | ✅ 401 | ✅ 200 × 2 |
| Online & Live Tutors — Bookings | /learner/panel-preview/app/tutors/bookings | Verified tutor | Approved shell | `GET /api/tutoring/bookings` | ✅ 401 | ✅ 200 × 1<br>⚠️ 1 declared not called (needs record id) |
| Online & Live Tutors — Classroom | /learner/panel-preview/app/tutors/classroom | Verified tutor | Approved shell | `GET /api/tutoring/bookings` | ✅ 401 | ✅ 200 × 1 |
| Online & Live Tutors — Earnings | /learner/panel-preview/app/tutors/earnings | Verified tutor | Approved shell | `GET /api/billing/connect/payouts`<br>`GET /api/billing/connect/status` | ✅ 401 | ✅ 200 × 2 |
| Online & Live Tutors — onboarding | /learner/panel-preview/app/tutors/onboarding | Verified tutor | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
| Online & Live Tutors — lesson entry | /learner/panel-preview/app/tutors/learner | Verified tutor | Approved lesson player | `GET /api/curriculum/deep-catalog`<br>`GET /api/resources/starfall-splashlearn/lessons/a1d01l1` | ✅ 200 / 401 | ✅ 200 × 2 |
| Schools & Educational Organisations — pathway entry | /learner/panel-preview/app/schools | Institution admin | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
| Schools & Educational Organisations — Admin overview | /learner/panel-preview/app/schools/dashboard | Institution admin | Approved shell | `GET /api/integrations/status`<br>`GET /api/school/admin/overview` | ✅ 200 / 401 | ✅ 200 × 2 |
| Schools & Educational Organisations — Roster | /learner/panel-preview/app/schools/roster | Institution admin | Approved shell | `GET /api/school/classes` | ✅ 401 | ✅ 200 × 1 |
| Schools & Educational Organisations — Licenses | /learner/panel-preview/app/schools/licenses | Institution admin | Approved shell | `GET /api/billing/plans`<br>`GET /api/billing/subscription` | ✅ 200 / 401 | ✅ 200 × 2 |
| Schools & Educational Organisations — Compliance | /learner/panel-preview/app/schools/compliance | Institution admin | Approved shell | `GET /api/compliance/privacy-export` | ✅ 401 | ✅ 200 × 1<br>⚠️ 1 declared not called (needs record id) |
| Schools & Educational Organisations — onboarding | /learner/panel-preview/app/schools/onboarding | Institution admin | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
| Schools & Educational Organisations — lesson entry | /learner/panel-preview/app/schools/learner | Institution admin | Approved lesson player | `GET /api/curriculum/deep-catalog`<br>`GET /api/resources/starfall-splashlearn/lessons/a1d01l1` | ✅ 200 / 401 | ✅ 200 × 2 |
| Studio & Content Creator — pathway entry | /learner/panel-preview/app/studio | Content author | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
| Studio & Content Creator — Projects | /learner/panel-preview/app/studio/dashboard | Content author | Approved shell | `GET /api/authoring/projects` | ✅ 401 | ✅ 200 × 1 |
| Studio & Content Creator — Coursebook | /learner/panel-preview/app/studio/coursebook | Content author | Approved shell | `GET /api/studio/coursebook/sequence/default` | ✅ 401 | ✅ 200 × 1<br>⚠️ 1 declared not called (needs record id) |
| Studio & Content Creator — Generations | /learner/panel-preview/app/studio/generations | Content author | Approved shell | _session only_ | ✅ 401 on session | ⚠️ NOT WIRED |
| Studio & Content Creator — StarPath | /learner/panel-preview/app/studio/starpath | Content author | Approved shell | `GET /api/addons/starpath/assignments`<br>`GET /api/addons/starpath/resources` | ✅ 401 | ✅ 200 × 2 |
| Studio & Content Creator — AI Governance | /learner/panel-preview/app/studio/governance | Content author | Approved shell | `GET /api/activities/moderation`<br>`GET /api/assessment/checkpoint/moderation/queue`<br>`GET /api/integrations/status`<br>`GET /api/practice/moderation`<br>`GET /api/tutor/admin/prompts`<br>`GET /api/tutor/quota` | ✅ 200 / 401 | ✅ 200 × 4<br>💳 402 × 1<br>🔒 403 × 1 |
| Studio & Content Creator — onboarding | /learner/panel-preview/app/studio/onboarding | Content author | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
| Studio & Content Creator — lesson entry | /learner/panel-preview/app/studio/learner | Content author | Approved lesson player | `GET /api/curriculum/deep-catalog`<br>`GET /api/resources/starfall-splashlearn/lessons/a1d01l1` | ✅ 200 / 401 | ✅ 200 × 2 |
| Tutor directory | /learner/panel-preview/tutors | Public | Approved shell | `GET /api/tutoring/tutors` | ✅ 401 | ✅ 200 × 1 |
| Tutor profile | /learner/panel-preview/tutors/profile | Public | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
| Tutor live room | /learner/panel-preview/tutor/live | Verified tutor | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
| Tutor session summary | /learner/panel-preview/tutor/summary | Verified tutor | Approved shell | _session only_ | ✅ 401 on session | _no endpoint_ |
---

## 5. Genuinely unresolved items

Only items that cannot be resolved from the existing architecture, each with the
exact conflict.

**1. `/learner?lesson=:lessonId` collides with the current mount.**
`/learner/` is served by an isolated static release on port 4302, and
`/learner?lesson=…` would be the same document with a query string. The Access
Panel home would have to read the query and hand off to the lesson player,
which means the lesson player has to live inside the Access Panel build rather
than in the r4 release where it is today. That is a structural decision about
where the player's source lives, and it changes what `/learner/lesson` redirects
to. **Technical reason it cannot be resolved unilaterally:** the r4 release is
the only place the 15-step player exists as running code, and moving it into the
h4 repo is a code migration, not a route change.

**2. Three backend environment variables are not being read.**
`~/eilps/backend/.env` ends with its last entries joined by literal `n`
characters instead of line breaks:
`…DYNAMIC=truenAGENT_TTS_CACHE_GENERATED=truenTUTOR_VIDEO_PROVIDER=dailyn`.
Node therefore never sees `AGENT_TTS_ENABLE_DYNAMIC`,
`AGENT_TTS_CACHE_GENERATED` or `TUTOR_VIDEO_PROVIDER`.
Confirmed live: `GET /api/agent/config` returns `dynamicSpeechEnabled: false`
although the file intends `true`. **Not fixed** — correcting it means editing a
production environment file and restarting the API, which requires approval.

**3. The UI APPROVED public landing is not the deployed public landing.**
`eilps.com/` serves the 11 Aug morning restored baseline. The 11 Aug afternoon
`hero-banner` design is the one carrying the explicit UI approval, and it has
never been deployed. This is correct under the approval rules — UI APPROVED is
not DEPLOY APPROVED — so it is not a defect, but it is an open decision: either
`hero-banner` is deployed when DEPLOY APPROVED is given, or the restored
baseline is confirmed as the intended live page. **Technical note:** the two are
different codebases. Live is a static markup + CSS pair injected by `Login.jsx`
inside the Vite app on port 4301; `hero-banner` is a Next.js app in a separate
repo. Deploying it is a build-and-mount job, not a file swap, and would need to
preserve the existing login and routing that `Login.jsx` provides.

**4. Junior placement.** Section 5 of the client's instruction requires learners
entering schools and classrooms to follow the placement / level-allocation
process. The roster import (`POST /api/school/classes/:id/bulk-import`) accepts
a `cefr_level` on each row and assigns it directly, with no placement step.
Whether an imported classroom learner should be forced through placement, or
whether a teacher-assigned level is sufficient, is a product decision.

---

## 6. Test accounts used

Created by me on 2026-08-14 for this matrix, all with the password
`PreviewPass123!`. Say the word and I will delete them.

`qa.student.<stamp>@example.com` · `qa.parent.<stamp>@example.com` ·
`qa.teacher.<stamp>@example.com` · `qa.live_tutor.<stamp>@example.com` ·
`qa.school.<stamp>@example.com` · `qa.studio.<stamp>@example.com`

**Junior was not tested with an adult-style login.** `POST /api/auth/register`
correctly refuses `student_classroom_u12` with
`classroom_student_use_class_code`. The junior session was obtained through the
intended classroom route instead: the QA teacher's class → roster import →
`POST /api/auth/student-login` with the class code, the learner's login id and
the learner's classroom password. That returned 200 and a real learner session,
and the junior screens were then measured with it.

---

## 7. Pre-deployment checklist

1. Record the current commit and build manifest hash
2. Back up the current production directory as `*.rollback-<stamp>`
3. Build staging and serve it where production cannot be affected
4. Verify the canonical public landing — compare rendered markup against the retained copy
5. Verify the canonical Access Panel — hero geometry and document height
6. Verify pathway routes — all 57 return 200
7. Verify API calls — React mounts and endpoints fire on every route
8. Verify the lesson player
9. Verify signed-out behaviour — gates, honest states, no placeholder names
10. Verify signed-in behaviour — one session per pathway, both security and data columns
11. Verify mobile at 360 and 390 wide, including Pip clearance
12. Obtain **DEPLOY APPROVED** for that exact build
13. Deploy
14. Production smoke test on the live domain
15. Retain rollback
