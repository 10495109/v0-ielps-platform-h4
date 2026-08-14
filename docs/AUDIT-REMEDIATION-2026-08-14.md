# IELPS Access Panel audit remediation

## Immutable baseline

- Source recovered from the exact 57-page Access Panel project.
- The approved component hierarchy, layout, typography, palette, imagery and responsive behaviour remain the visual baseline.
- The public landing page is outside this package and is not modified.
- No rollback or source older than 14 August may be promoted by this package.
- This remediation is a separate, inactive release until root approval and acceptance testing.

## Corrected architecture

The browser calls canonical same-origin `/api/...` routes. The obsolete `/api/eilps` proxy has been removed. A request first attempts the existing bearer session and may refresh it through `/api/auth/refresh`; credentials are never written to browser storage.

Every operational panel uses one explicit state: `Live`, `Empty`, `Authentication required`, `Permission required`, `Upgrade required`, `Admin only`, `Provider not configured`, `Not wired`, or `Unavailable`. A successful response whose shape does not match the panel contract is `Unavailable`, never `Live`. Authored sample values are render-safe development fixtures only and are not displayed as operational data.

## Verified lesson chain

1. `GET /api/curriculum/deep-catalog` (the frontend selects the requested lesson ID)
2. `GET /api/lesson-support/lessons/:id/engine-15`
3. `GET /api/resources/starfall-splashlearn/lessons/:id`
4. Learner completes the nine canonical activity mechanics inside Step 14.
5. Smart Review proof is created by `POST /api/review/saved-phrase`.
6. One idempotent evidence set is submitted to `POST /api/activities/:lessonId/submissions`.
7. The frontend displays only the returned server score, accuracy, stars, status and result reasons.
8. Completion uses `POST /api/progress/lesson` with `lessonId`, server `submissionId`, and server accuracy.
9. The adaptive continuation is read from `GET /api/engine/next`; the client does not invent a next lesson or grade.

The 15-stage visual remains the learner journey. Early activities are guided pedagogy. Step 14 is authoritative assessment evidence. Step 15 can persist completion only after a verified submission.

## Curriculum performance

Dashboard course summaries now use `GET /api/curriculum/deep-summary`. Junior catalogue cards use `GET /api/practice/catalog?level=A1&limit=6`. The 6.9 MB deep catalogue is no longer requested merely to draw dashboard cards. Canonical curriculum content is unchanged.

## Activity template discrepancy

The canonical server summary does not contain either disputed figure. It reports 8 unique mechanics across 9 screens per lesson: dialogue sequence, phrase building, listen/repeat self-check, two multiple-choice forms, Smart Review save, productive transfer, and tap-the-lesson-words. Tap-the-lesson-words is used twice, producing 9 screens. The old “12 templates / 11 named groups” claim is therefore retired rather than reproduced in a new route or manifest.

## Placement

- Adult learners take placement after account creation.
- Junior, parent-created and school/classroom learners require placement or an authorised level allocation before their adaptive course starts.
- Parent, teacher and school administrators do not take a learner placement test themselves.
- The existing item/score/calibration contracts are `/api/assessment/level-check`, `/api/assessment/level-check/score`, and `/api/assessment/placement/calibrate`.
- No unverified administrator-to-child allocation mutation was invented. That missing workflow must remain `Not wired` until a canonical route is approved.

## PiP verification boundary

PiP remains a separate platform component and is not visually redesigned here. Verified canonical contracts are `/api/agent/config`, `/api/agent/chat`, `/api/agent/voice`, and `/api/lesson-support/language-context`. The backend advertises Cloudflare-derived context, manual override support, six core support languages, pre-rendered common-path audio and provider-gated dynamic speech. Authentication, remembered override, actual audio retrieval and ElevenLabs fallback require the authenticated browser acceptance suite before promotion.

## Preview protection

Next metadata emits `noindex, nofollow` for every Access Panel route. Production should build with `IELPS_PANEL_BASE_PATH=/learner/panel-preview` and retain equivalent Nginx protection. This does not change the public landing metadata.

## Still provider- or permission-gated

- Real tutor room entry remains provider-gated by the existing tutoring backend.
- Prompt administration and evaluation remain administrator-only.
- Stripe checkout, KYC, WebRTC, Azure pronunciation, ElevenLabs voice and external SSO are shown according to their real backend/provider state.
- Capabilities without a canonical route are explicitly `Not wired`; no duplicate backend route is introduced.
