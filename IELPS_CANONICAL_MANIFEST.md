# IELPS Canonical Manifest

Created 2026-08-14 in response to *IELPS Developer Handoff — Canonical UI, Access
Panel & Backend Integration Rules*, section 13.

This file records which artefact is canonical for each component, and on what
approval. It is resolved **before** any alternative file or release is used.

Rule: the source of truth is the **latest explicitly approved state** of a
component, not the most recently uploaded file. Where the approved source cannot
be located, this file must say `CANONICAL SOURCE NOT FOUND` and that component
stops. Nothing is substituted.

Approval categories are kept separate throughout: **UI APPROVED**,
**FUNCTION APPROVED**, **DEPLOY APPROVED**. One never implies another.

---

## 1. Manifest

### LANDING_CANONICAL
- Source: `04-pearson-canada-colour-only-offline-standalone-preview.html` (client file, 2026-08-02)
- Lives as: `frontend/src/landing-markup.html` (11,158 bytes) + `frontend/src/landing.css` (52,106 bytes) on the server, injected by `Login.jsx`
- Approval: **UI APPROVED** 2026-08-11 — "this is perfect. My exact vision."
- Deployed: **DEPLOY APPROVED**, live on eilps.com
- Verified 2026-08-14: live page renders identically to the client's own preview file at 1280 wide. The only difference is that the offline preview draws icons as `?` because its icon font is not embedded.

### GATEWAY_CANONICAL
- Source: `frontend/src/SignInRequired.jsx` + `frontend/src/gated-routes.js`
- Approval: **FUNCTION APPROVED** 2026-08-13 — "go with the option that follows the actual architecture and build of the platform - Option 2"
- Deployed: live 2026-08-13 20:57. Covers 20 routes. URL is deliberately preserved so sign-in returns the visitor to the page they asked for.
- The account types listed on each locked door are computed from `ACCOUNT_PATHWAYS[].allowedRoutes`, the same source the signed-in navigation uses. They are never hand-typed.
- ⚠️ OPEN: section 5B of the handoff specifies Landing → Gateway → **Placement** → Result → activation → Access Panel. Today the landing goes to the Access Panel directly. See open question 5.

### ACCESS_PANEL_CANONICAL
- Repo: `10495109/v0-ielps-platform-h4`
- Branch: `access-panel-approved-design`
- Commit: `e47f09e001f97ce321d1a1fc195e8c3fe1605652`
- Parent (repo as received): `c3131a4ba26d95e599f7ae24bf8efb86fa83a21f`
- Status: **UI APPROVED pending** — the hero and card design were approved 2026-08-12 ("this is incredible work. Well done. Now we can deploy"), but those corrections existed only as hand edits on the deployed HTML. This commit moves them into the repo source so a rebuild cannot revert them. Two visual differences remain undecided — see open questions 1 and 2.
- Status: **NOT DEPLOY APPROVED.** Staged only.
- ⚠️ Not pushed to `main`: the repo README states that merges to `main` auto-deploy via v0.

### PATHWAYS_CANONICAL
- Source: `lib/apps/*.ts` in the repo above, plus the client's `PATHWAYS.zip` wiring map (2026-08-12)
- 7 account pathways, 31 screens, 7 onboarding flows
- Approval: **FUNCTION APPROVED** 2026-08-12 — "the correct wiring map routes/pathways for all accounts"

### LESSON_PLAYER_CANONICAL
- ⚠️ **AMBIGUOUS — NOT RESOLVED.** Two lesson players exist. See open question 3.
  - A. `/learner/lesson` — 15-step player, release `ielps-a1-c2-learner-20260805-r4-discovery`. Live today. Visual sent to client 2026-08-14.
  - B. `/learner/app/<pathway>/learner` — the h4 repo's in-pathway player, `lib/lesson-player/spec.ts` + `components/lesson-player/`. 7 routes, staged.
- Per section 12 of the handoff, this component does not proceed until the client names one.

### DISCOVER_CANONICAL
- ⚠️ **AMBIGUOUS — NOT RESOLVED.** See open question 4.
  - A. `/learner/discover` — release r4. Live today. Reads a build-time curriculum file; makes no API call.
  - B. `/learner/app/adult/discover` — "Discover & StarPath" in the h4 repo. Calls `GET /api/discovery/catalogue` (200).

### PALETTE_CANONICAL
- Source: `data/NEW-COLOUR-PALETTE-aea14e.docx` in the repo
- ⚠️ The handoff PDF, section 5G, lists five core colours and does **not** include turquoise `#22C7C6`, which the palette document does include and which the Access Panel uses. See open question 1.

### BACKEND_CANONICAL
- The existing IELPS API on the client's own server. No backend route was added, renamed or loosened.
- 39 distinct endpoints are called by the Access Panel. Full list in section 2.

### CURRENT_PRODUCTION_RELEASE
- Main site (eilps.com): `~/eilps/frontend/dist`, build manifest `sourceSha256 00b909f5c230ee9b91c6e99189a1608c16c134dde0bb0a3816a7707e7662b0b7`, generated 2026-08-13T20:55:39Z, served on port 4301
- Access Panel (/learner): `~/eilps/releases/ielps-a1-c2-learner-20260805-r4-discovery/out`, served on port 4302
- Rollback retained: `~/eilps/frontend/dist.rollback-gate-20260813T205527Z`

### LAST_APPROVED_BUILD
- Main site: the 2026-08-13 gate build. **DEPLOY APPROVED**, live.
- Access Panel: none yet. The h4 build is staged at `~/eilps/releases/access-panel-h4-20260814/out` on port 4311 and awaits **DEPLOY APPROVED**.

---

## 2. Integration matrix

Every route in the staged Access Panel build. Endpoints are not copied from a
spec — they are the requests the page actually issued in a browser on
2026-08-14, with the status the live server returned.

The test was run **signed out**, so `401` is the correct and expected answer for
a protected endpoint; it is the proof that permissions are being enforced rather
than bypassed. `GET /api/auth/me` and `POST /api/auth/refresh` fire on all 57
pages (session bridge) and are omitted from each row for readability.

Result: **57 routes, 57 mount React, 57 issue live API calls, 0 page errors.**

⚠️ The signed-in half of this matrix cannot be completed without test accounts.
See open question 6.

| Screen | Route | Role | Canonical UI | Backend endpoints fired (signed out) | Functional | Tested |
| --- | --- | --- | --- | --- | --- | --- |
| Access Panel home | /learner/ | All | Approved 12 Aug | `GET /api/auth/pathways` → 200 | React mounts | ✅ |
| Junior Learners — pathway home | /learner/app/junior | Under-12 learner | Approved shell | _session only_ | React mounts | ✅ |
| Junior Learners — My Home | /learner/app/junior/dashboard | Under-12 learner | Approved shell | `GET /api/curriculum/deep-catalog` → 200<br>`GET /api/gamification/profile` → 401<br>`GET /api/progress` → 401 | React mounts | ✅ |
| Junior Learners — Lessons | /learner/app/junior/lessons | Under-12 learner | Approved shell | `GET /api/curriculum/deep-catalog` → 200 | React mounts | ✅ |
| Junior Learners — Games | /learner/app/junior/games | Under-12 learner | Approved shell | `GET /api/practice/next` → 401<br>`GET /api/review/due` → 401 | React mounts | ✅ |
| Junior Learners — Classroom | /learner/app/junior/classroom | Under-12 learner | Approved shell | `GET /api/tutoring/bookings` → 401 | React mounts | ✅ |
| Junior Learners — Progress | /learner/app/junior/progress | Under-12 learner | Approved shell | `GET /api/gamification/leaderboard` → 401<br>`GET /api/progress` → 401 | React mounts | ✅ |
| Junior Learners — onboarding | /learner/app/junior/onboarding | Under-12 learner | Approved shell | _session only_ | React mounts | ✅ |
| Junior Learners — Lesson Player (running) | /learner/app/junior/learner | Under-12 learner | Approved lesson player | `GET /api/curriculum/deep-catalog` → 200<br>`GET /api/resources/starfall-splashlearn/lessons/a1d01l1` → 401 | React mounts | ✅ |
| Adult Scholars & Self-Starters — pathway home | /learner/app/adult | Self-paced learner | Approved shell | _session only_ | React mounts | ✅ |
| Adult Scholars & Self-Starters — My Course | /learner/app/adult/dashboard | Self-paced learner | Approved shell | `GET /api/curriculum/deep-catalog` → 200<br>`GET /api/engine/schedule` → 401<br>`GET /api/progress` → 401 | React mounts | ✅ |
| Adult Scholars & Self-Starters — Lesson Player | /learner/app/adult/player | Self-paced learner | Approved shell | `GET /api/engine/next` → 401 | React mounts | ✅ |
| Adult Scholars & Self-Starters — Discover | /learner/app/adult/discover | Self-paced learner | Approved shell | `GET /api/discovery/catalogue` → 200 | React mounts | ✅ |
| Adult Scholars & Self-Starters — Review | /learner/app/adult/review | Self-paced learner | Approved shell | `GET /api/engine/review-queue` → 401<br>`GET /api/practice/filters` → 401<br>`GET /api/review/due` → 401 | React mounts | ✅ |
| Adult Scholars & Self-Starters — Progress | /learner/app/adult/progress | Self-paced learner | Approved shell | `GET /api/certificates/eligibility/B1` → 401<br>`GET /api/engine/mastery` → 401 | React mounts | ✅ |
| Adult Scholars & Self-Starters — onboarding | /learner/app/adult/onboarding | Self-paced learner | Approved shell | _session only_ | React mounts | ✅ |
| Adult Scholars & Self-Starters — Lesson Player (running) | /learner/app/adult/learner | Self-paced learner | Approved lesson player | `GET /api/curriculum/deep-catalog` → 200<br>`GET /api/resources/starfall-splashlearn/lessons/a1d01l1` → 401 | React mounts | ✅ |
| Parents & Guardians — pathway home | /learner/app/parents | Family account | Approved shell | _session only_ | React mounts | ✅ |
| Parents & Guardians — Overview | /learner/app/parents/dashboard | Family account | Approved shell | `GET /api/school/parent/dashboard` → 401 | React mounts | ✅ |
| Parents & Guardians — Access & links | /learner/app/parents/links | Family account | Approved shell | `GET /api/school/parent/dashboard` → 401 | React mounts | ✅ |
| Parents & Guardians — Reports | /learner/app/parents/reports | Family account | Approved shell | `GET /api/progress` → 401 | React mounts | ✅ |
| Parents & Guardians — Billing | /learner/app/parents/billing | Family account | Approved shell | `GET /api/billing/plans` → 200<br>`GET /api/billing/subscription` → 401 | React mounts | ✅ |
| Parents & Guardians — onboarding | /learner/app/parents/onboarding | Family account | Approved shell | _session only_ | React mounts | ✅ |
| Parents & Guardians — Lesson Player (running) | /learner/app/parents/learner | Family account | Approved lesson player | `GET /api/curriculum/deep-catalog` → 200<br>`GET /api/resources/starfall-splashlearn/lessons/a1d01l1` → 401 | React mounts | ✅ |
| Educators & Classroom Teachers — pathway home | /learner/app/teachers | Classroom teacher | Approved shell | _session only_ | React mounts | ✅ |
| Educators & Classroom Teachers — Overview | /learner/app/teachers/dashboard | Classroom teacher | Approved shell | `GET /api/school/classes` → 401<br>`GET /api/school/dashboard` → 401 | React mounts | ✅ |
| Educators & Classroom Teachers — Classes | /learner/app/teachers/classes | Classroom teacher | Approved shell | _session only_ | React mounts | ✅ |
| Educators & Classroom Teachers — Assignments | /learner/app/teachers/assignments | Classroom teacher | Approved shell | _session only_ | React mounts | ✅ |
| Educators & Classroom Teachers — Reports | /learner/app/teachers/reports | Classroom teacher | Approved shell | _session only_ | React mounts | ✅ |
| Educators & Classroom Teachers — onboarding | /learner/app/teachers/onboarding | Classroom teacher | Approved shell | _session only_ | React mounts | ✅ |
| Educators & Classroom Teachers — Lesson Player (running) | /learner/app/teachers/learner | Classroom teacher | Approved lesson player | `GET /api/curriculum/deep-catalog` → 200<br>`GET /api/resources/starfall-splashlearn/lessons/a1d01l1` → 401 | React mounts | ✅ |
| Online & Live Tutors — pathway home | /learner/app/tutors | Verified tutor | Approved shell | _session only_ | React mounts | ✅ |
| Online & Live Tutors — Overview | /learner/app/tutors/dashboard | Verified tutor | Approved shell | `GET /api/tutoring/application` → 401<br>`GET /api/tutoring/bookings` → 401 | React mounts | ✅ |
| Online & Live Tutors — Bookings | /learner/app/tutors/bookings | Verified tutor | Approved shell | `GET /api/tutoring/bookings` → 401 | React mounts | ✅ |
| Online & Live Tutors — Classroom | /learner/app/tutors/classroom | Verified tutor | Approved shell | `GET /api/tutoring/bookings` → 401 | React mounts | ✅ |
| Online & Live Tutors — Earnings | /learner/app/tutors/earnings | Verified tutor | Approved shell | `GET /api/billing/connect/payouts` → 401<br>`GET /api/billing/connect/status` → 401 | React mounts | ✅ |
| Online & Live Tutors — onboarding | /learner/app/tutors/onboarding | Verified tutor | Approved shell | _session only_ | React mounts | ✅ |
| Online & Live Tutors — Lesson Player (running) | /learner/app/tutors/learner | Verified tutor | Approved lesson player | `GET /api/curriculum/deep-catalog` → 200<br>`GET /api/resources/starfall-splashlearn/lessons/a1d01l1` → 401 | React mounts | ✅ |
| Schools & Educational Organisations — pathway home | /learner/app/schools | Institution admin | Approved shell | _session only_ | React mounts | ✅ |
| Schools & Educational Organisations — Admin overview | /learner/app/schools/dashboard | Institution admin | Approved shell | `GET /api/integrations/status` → 200<br>`GET /api/school/admin/overview` → 401 | React mounts | ✅ |
| Schools & Educational Organisations — Roster | /learner/app/schools/roster | Institution admin | Approved shell | `GET /api/school/classes` → 401 | React mounts | ✅ |
| Schools & Educational Organisations — Licenses | /learner/app/schools/licenses | Institution admin | Approved shell | `GET /api/billing/plans` → 200<br>`GET /api/billing/subscription` → 401 | React mounts | ✅ |
| Schools & Educational Organisations — Compliance | /learner/app/schools/compliance | Institution admin | Approved shell | `GET /api/compliance/privacy-export` → 401 | React mounts | ✅ |
| Schools & Educational Organisations — onboarding | /learner/app/schools/onboarding | Institution admin | Approved shell | _session only_ | React mounts | ✅ |
| Schools & Educational Organisations — Lesson Player (running) | /learner/app/schools/learner | Institution admin | Approved lesson player | `GET /api/curriculum/deep-catalog` → 200<br>`GET /api/resources/starfall-splashlearn/lessons/a1d01l1` → 401 | React mounts | ✅ |
| Studio & Content Creator — pathway home | /learner/app/studio | Content author | Approved shell | _session only_ | React mounts | ✅ |
| Studio & Content Creator — Projects | /learner/app/studio/dashboard | Content author | Approved shell | `GET /api/authoring/projects` → 401 | React mounts | ✅ |
| Studio & Content Creator — Coursebook | /learner/app/studio/coursebook | Content author | Approved shell | `GET /api/studio/coursebook/sequence/default` → 401 | React mounts | ✅ |
| Studio & Content Creator — Generations | /learner/app/studio/generations | Content author | Approved shell | _session only_ | React mounts | ✅ |
| Studio & Content Creator — StarPath | /learner/app/studio/starpath | Content author | Approved shell | `GET /api/addons/starpath/assignments` → 401<br>`GET /api/addons/starpath/resources` → 401 | React mounts | ✅ |
| Studio & Content Creator — AI Governance | /learner/app/studio/governance | Content author | Approved shell | `GET /api/activities/moderation` → 401<br>`GET /api/assessment/checkpoint/moderation/queue` → 401<br>`GET /api/integrations/status` → 200<br>`GET /api/practice/moderation` → 401<br>`GET /api/tutor/admin/prompts` → 401<br>`GET /api/tutor/quota` → 401 | React mounts | ✅ |
| Studio & Content Creator — onboarding | /learner/app/studio/onboarding | Content author | Approved shell | _session only_ | React mounts | ✅ |
| Studio & Content Creator — Lesson Player (running) | /learner/app/studio/learner | Content author | Approved lesson player | `GET /api/curriculum/deep-catalog` → 200<br>`GET /api/resources/starfall-splashlearn/lessons/a1d01l1` → 401 | React mounts | ✅ |
| Tutors (directory) | /learner/tutors | Public | Approved shell | `GET /api/tutoring/tutors` → 401 | React mounts | ✅ |
| Profile (directory) | /learner/tutors/profile | Public | Approved shell | _session only_ | React mounts | ✅ |
| Live (directory) | /learner/tutor/live | Verified tutor | Approved shell | _session only_ | React mounts | ✅ |
| Summary (directory) | /learner/tutor/summary | Verified tutor | Approved shell | _session only_ | React mounts | ✅ |

---

## 3. Open questions — blocked until answered

Per section 18 of the handoff: do not guess, do not substitute, flag the
ambiguity before changing the component.

1. **Turquoise `#22C7C6`.** The word "IELPS" in the Access Panel headline is
   turquoise in the repo and learning blue `#3860BE` on the live page. The live
   value is my own error from 2026-08-11, when I wrongly treated turquoise as
   off-palette. The palette document includes turquoise; section 5G of the
   handoff does not list it. **Which is canonical?** Needs UI APPROVED either way.

2. **Pathway card titles.** The live cards carry short names I typed by hand.
   The built cards read `label` from `GET /api/auth/pathways`, e.g. "Junior
   Learners (Under 12s)". Server values are real data and hand-typed values are
   not, so the build uses the server. Confirm, since it is a visible change.

3. **LESSON_PLAYER_CANONICAL** — A or B above.

4. **DISCOVER_CANONICAL** — A or B above.

5. **Placement in the funnel.** Section 5B requires Landing → Gateway →
   Placement → Result → activation → Access Panel. Today the landing goes
   straight to the Access Panel. Is placement meant to sit between them, and if
   so at which point?

6. **Test accounts.** Steps 5 and 17 of the handoff require permissions, roles,
   signed-in state and server-backed actions to be verified. That cannot be done
   from a signed-out browser. One test login per pathway — junior, adult, parent,
   teacher, tutor, school admin, studio author — would let the signed-in half of
   the matrix be completed and evidenced.

7. **The `?level=` band.** The band under the Access Panel hero that reads the
   level from the address (FUNCTION APPROVED 2026-08-13, live) was built on the
   r4 release and is not in the h4 repo. It disappears when the staged build is
   swapped in unless it is ported first. Port it, or drop it?

---

## 4. Pre-deployment checklist

Section 14 of the handoff, as a working procedure:

1. Record the current commit and build manifest hash
2. Back up the current production directory (keep as `*.rollback-<stamp>`)
3. Build staging, serve on a private port
4. Verify canonical Landing — compare rendered markup against the retained copy
5. Verify canonical Access Panel — hero geometry and document height
6. Verify pathway routes — all 57 return 200
7. Verify API calls — React mounts and endpoints fire on every route
8. Verify lesson player
9. Verify signed-out behaviour — gates, honest states, no placeholder names
10. Verify signed-in behaviour — blocked, see open question 6
11. Verify mobile at 360 and 390 wide, including Pip clearance
12. Obtain **DEPLOY APPROVED** for that exact build
13. Deploy
14. Production smoke test on the live domain
15. Retain rollback

## 5. Notes on the two legacy routes

`/learner/lesson` and `/learner/discover` belong to release r4 and stay in place
so no shared link breaks. They were copied into the staged release with
`cp -r --update=none` before staging, and both return 200 there.

Both request `/_vercel/insights/script.js`, a leftover v0 tracker. The server has
no such file and answers with HTML, which the browser logs as
`Unexpected token '<'`. Nothing visible breaks. The staged h4 build does not have
this: no file in its output references `_vercel/insights`.
