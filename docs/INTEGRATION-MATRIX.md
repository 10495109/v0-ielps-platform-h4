# Canonical integration matrix

| Capability | Canonical route(s) | Access rule | UI state rule |
|---|---|---|---|
| Session | `POST /api/auth/refresh`, `GET /api/auth/me`, `POST /api/auth/logout` | Session | Authentication required on 401 |
| Adult registration | `POST /api/auth/register` | Public | Advance only on accepted response |
| Junior class access | `POST /api/auth/student-profiles`, `POST /api/auth/student-login` | Public/class code | No simulated success |
| Child profiles | `POST /api/auth/child-profiles` | Parent | Permission required on 403 |
| Placement | `GET /api/assessment/level-check`, `POST /api/assessment/level-check/score`, `POST /api/assessment/placement/calibrate` | Learner | Admins allocate; they do not sit the test |
| Curriculum summary | `GET /api/curriculum/deep-summary` | Public | Lightweight dashboard source |
| Lesson | `GET /api/curriculum/deep-catalog` (select by lesson ID), `GET /api/lesson-support/lessons/:id/engine-15` | Auth/entitlement | No sample lesson on failure |
| Playable activity | `GET /api/resources/starfall-splashlearn/lessons/:id` | Auth/entitlement | Nine canonical mechanics |
| Activity marking | `POST /api/activities/:lessonId/submissions` | Learner | Server score only |
| Smart Review | `POST /api/review/saved-phrase`, `GET /api/review/due`, `POST /api/review/attempts` | Learner | Saved-item proof required |
| Progress | `POST /api/progress/lesson`, `GET /api/progress`, `GET /api/engine/next` | Learner | Verified submission required |
| Discovery | `GET /api/discovery/catalogue`, `POST /api/discovery/events`, `POST /api/discovery/practice` | Mixed | Optional enrichment |
| StarPath | `/api/addons/starpath/*` | Auth/role | Standalone handoff plus approved lesson activity |
| Speaking/AI | `/api/tutor/*`, `POST /api/assessment/pronunciation`, `POST /api/assessment/grade-writing` | Auth/quota/provider | Provider state is explicit |
| PiP | `/api/agent/config`, `/api/agent/chat`, `/api/agent/voice`, `/api/lesson-support/language-context` | Mixed | Preserve existing visual |
| Tutors | `/api/tutoring/*` | Auth/payment/provider | Payment and join-window gates are server-owned |
| Parent | `/api/school/parent/*` | Parent | Own linked children only |
| Teacher/classroom | `/api/school/classes/*`, `/api/school/assignments/*` | Teacher | Class-scoped permissions |
| School | `/api/school/admin/*`, `/api/school/classes/*` | Organisation admin | Organisation-scoped permissions |
| Studio | `/api/authoring/projects/*` | Studio | Author, validate, publish |
| CLAIS | `/api/studio/coursebook/*` | Studio | Coursebook-to-Lesson workflow |
| AI governance | `/api/studio/ai/*`, `/api/tutor/admin/prompts/*` | Studio/admin | Prompt/eval controls remain admin-only |
| Billing | `/api/billing/*` | Account/Stripe | 402 is Upgrade required |
| Certificates | `/api/certificates/*`, `/api/certificates/verify/:code` | Mixed/public verify | Public verification must bypass auth guard |
| Partners | `/api/partners/*` | Partner | Payout provider state explicit |

The canonical prefix is `/api`, not `/api/eilps`. No compatibility routes are added merely to reproduce outdated documentation.
