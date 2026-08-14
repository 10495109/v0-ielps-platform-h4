# Access Panel remediation test report

Date: 14 August 2026

## Passed

- ESLint: pass, zero findings.
- TypeScript: pass with build-error suppression removed.
- Next.js production build: pass; standalone output generated.
- Remediation contract checks: 12/12 pass.
- Local page checks: 59/59 return HTTP 200, including Adult and Junior placement.
- Preview protection: 59/59 pages emit noindex.
- Visual baseline: 28/28 landing UI and public asset files are byte-identical to the recovered approved source.
- Browser review: approved landing hero, typography, palette, spacing and imagery render correctly.
- Operational fallback review: an unavailable lesson shows `Not wired`; sample lesson content is not rendered.
- Public contract smoke: PiP config 200, language context 200, curriculum summary 200, Discovery catalogue 200, activity summary 200, invalid certificate verification 404.
- Source/backend/runtime/migration SHA-256 inventories captured read-only.

## Verified contract behaviour

- The Access Panel uses same-origin `/api`, not `/api/eilps`.
- Dashboard curriculum cards use lightweight routes.
- Step 14 captures the nine canonical mechanics and submits one idempotent evidence set.
- Smart Review evidence is created before activity submission.
- Scores, stars and accuracy are read from the activity submission response.
- Lesson completion requires the server submission ID.
- Frontend optimistic grading and the fabricated pronunciation score are removed.
- 401, 402, 403, provider, empty, unavailable and not-wired states remain distinct.

## Promotion-only acceptance still required

No production promotion was authorised by the supplied audit. Therefore the following write-path tests were deliberately not run against production:

- authenticated seven-role browser matrix;
- real activity submission and progress mutation;
- Stripe checkout/payment mutation;
- tutor booking, room token, notes and end-session mutation;
- Studio author/validate/publish mutation;
- authenticated PiP memory and ElevenLabs fallback;
- root-owned release-pointer switch and four-service runtime migration.

Those tests belong to the controlled staging/promotion window and require explicit deployment approval. The release templates and acceptance contracts are included, but no live service, pointer, backend, database, Nginx, frontend or public landing file was changed.
