# IELPS Non-Adult Account Pathways Developer Specification

Generated: 2026-08-10  
Scope: Every IELPS account type except the Adult Learner account.  
Live/server status: No live platform, backend, server, deployment, colour, layout, or branding changes are included in this document.

This specification describes the UI features, functions, steps, screens, states, endpoint contracts, mapping rules, and handoff behaviour for the following IELPS pathways:

1. Junior Learners under 12
2. Parents and Guardians
3. Educators and Classroom Teachers
4. Schools and Educational Organisations
5. Online and Live Tutors
6. Studio and Content Creators
7. StarPath standalone enrichment
8. Discovery standalone enrichment
9. Referral and Partner dashboard

Adult Scholars and Self-Starters are intentionally excluded.

---

## 1. Global Entry Architecture

### Landing Page Account Selector

Primary landing CTA area must route users into one of the supported pathways.

Required visible account cards:

| Card | Label | Route | Purpose |
|---|---|---|---|
| Junior Learners | Junior Learners under 12 | `/student-login` | Safe student access through class code, QR, or parent-linked profile |
| Parents | Parents and Guardians | `/signup/parent` | Adult family account with child profiles and reports |
| Teachers | Educators and Classroom Teachers | `/signup/teacher` | Classroom creation, assignments, rosters, reports |
| Live Tutors | Online and Live Tutors | `/tutors` | Tutor marketplace and tutor onboarding |
| School | Schools and Educational Organisations | `/school` | Organisation licensing, reporting, seats, rosters |
| Studio | Studio and Content Creator | `/studio` | Authoring, publishing, Coursebook-to-Lesson, StarPath resources |
| StarPath | StarPath Practice | `/starpath` | Standalone gamified enrichment |
| Discover | Discover | `/discover` | Level/topic/skill/media enrichment |

### Global Frontend Rules

- The structured A1-C2 course spine remains the source of academic progress.
- StarPath and Discover are enrichment layers, not replacements for the required course.
- Junior learners do not self-register as independent adult accounts.
- Protected learner routes require authentication or class-code session.
- All learner progress writes must go through backend progress endpoints.
- Audio uses lesson/audio manifests and play/pause controls.
- Payment-gated content checks billing/entitlement before unlock.
- Certificates appear only after backend eligibility confirms completion.

### Shared Backend Contracts

```http
GET  /api/health
GET  /api/me
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/student-login
GET  /api/curriculum/levels
GET  /api/curriculum/lessons/:lessonId
GET  /api/curriculum/deep-catalog
GET  /api/audio/lesson/:lessonId/manifest
POST /api/progress/lesson
GET  /api/progress/summary
GET  /api/review/due
POST /api/review/results
GET  /api/certificates
GET  /api/certificates/verify/:code
GET  /api/billing/subscription
POST /api/billing/checkout
```

---

## 2. Junior Learners Under 12

### Pathway Summary

```text
Landing page
→ Junior Learners card
→ /student-login
→ Class-code login or QR login
→ Junior dashboard
→ Assigned lesson
→ Junior lesson player
→ Safe review
→ Progress evidence
→ Certificate eligibility when applicable
```

### Screen 1: Student Class-Code Entry

Route: `/student-login`

Purpose: Let under-12 learners enter a secure classroom-linked session without independent account creation.

UI features:

- Class code input
- Student ID or profile selector
- Student password input when required
- QR login option
- Teacher/help note
- Large primary button: `Start Learning`
- Error panel for invalid code, expired class, locked profile

Backend contracts:

```http
POST /api/auth/student-login
GET  /api/classroom/code/:classCode
```

State rules:

- Invalid class code keeps learner on this screen.
- Valid class code reveals matching student profiles if profile selection is required.
- Successful session redirects to `/dashboard`.
- Junior learner cannot access billing, Studio, school admin, tutor onboarding, or adult signup flows.

### Screen 2: Junior Dashboard

Route: `/dashboard`

Purpose: Show one clear next learning action.

UI features:

- Welcome message using child profile name
- Assigned lesson card
- Continue button
- Class activity card
- Memory review card
- Progress ring
- Safe reward strip: stars, badges, streak where enabled
- Teacher message area

Backend contracts:

```http
GET /api/me
GET /api/classes/:classId/assignments
GET /api/progress/summary
GET /api/review/due
GET /api/rewards/summary
```

State rules:

- If assigned lesson exists, primary CTA is `Continue Lesson`.
- If no assigned lesson exists, primary CTA is `Review Words`.
- Teacher-assigned work appears before optional enrichment.

### Screen 3: Assigned Lesson

Route: `/learner?lesson=:lessonId`

Purpose: Open the classroom-assigned IELPS lesson.

UI features:

- CEFR badge
- Lesson title
- Teacher assignment tag
- 15-step lesson rail adapted for junior readability
- Play/pause audio
- Tap-to-reveal vocabulary cards
- Safe AI help only if enabled by school/parent policy

Backend contracts:

```http
GET  /api/curriculum/deep-catalog
GET  /api/audio/lesson/:lessonId/manifest
POST /api/activities/:lessonId/submissions
POST /api/progress/lesson
```

State rules:

- Learner cannot skip teacher-required lesson.
- Completion writes classroom evidence.
- After completion, next CTA returns to dashboard or next assignment.

### Screen 4: Safe Review

Route: `/practice`

Purpose: Spaced repetition for assigned/weak lesson items.

UI features:

- Word recall cards
- Listen and repeat
- Picture-word matching
- Short confidence check
- Continue dashboard CTA

Backend contracts:

```http
GET  /api/review/due
POST /api/review/results
GET  /api/audio/review/manifest
```

State rules:

- Wrong answers reschedule item.
- Correct answers increase interval.
- Review never unlocks a skipped core lesson.

### Screen 5: Classroom Participation

Route: `/classroom`

Purpose: Support live or teacher-led classroom participation.

UI features:

- Current class
- Live lesson status
- Join button
- Activity feed
- Teacher prompts

Backend contracts:

```http
GET  /api/classroom/session/current
POST /api/classroom/session/:id/join
POST /api/classroom/session/:id/activity
```

State rules:

- Join disabled if no active class session.
- Participation writes classroom evidence.

### Screen 6: Junior Progress

Route: `/progress`

Purpose: Show safe progress evidence for learner, teacher, and parent.

UI features:

- Completed lessons
- Skills progress
- Words remembered
- Badges earned
- Teacher feedback

Backend contracts:

```http
GET /api/progress/summary
GET /api/reports/learner/:learnerId
GET /api/rewards/summary
```

Completion handoff:

```text
Complete assigned lesson
→ Save progress
→ Update teacher evidence
→ Update parent report
→ Queue review items
→ Return to dashboard
```

---

## 3. Parents and Guardians

### Pathway Summary

```text
Landing page
→ Parents and Guardians
→ Parent registration
→ Verify adult account
→ Create/link child profile
→ Family dashboard
→ Child course view
→ Reports
→ Billing/subscription
→ Certificate/progress evidence
```

### Screen 1: Parent Registration

Route: `/signup/parent`

UI features:

- Adult age check
- Google/Apple/email registration options
- Email verification code
- Password creation
- Child profile creation
- Grade/age/level selection

Backend contracts:

```http
POST /api/auth/register
POST /api/auth/verify-email
POST /api/auth/child-profiles
GET  /api/placement/options
```

State rules:

- Parent account must verify before managing child profiles.
- Child profile creation is required before entering family dashboard.

### Screen 2: Family Dashboard

Route: `/parent`

UI features:

- Linked child selector
- Today’s learning status
- Assigned work from teacher
- Home practice card
- Weekly progress chart
- Billing status

Backend contracts:

```http
GET /api/me
GET /api/parent/children
GET /api/progress/summary?childId=:childId
GET /api/billing/subscription
```

State rules:

- If child is classroom-linked, teacher assignments appear first.
- If child is home-only, course continuation appears first.

### Screen 3: Home Access Connection

Route: `/parent/link`

UI features:

- Invitation code input
- QR code scan option
- Child verification details
- Link account button

Backend contracts:

```http
POST /api/parent/link-child
GET  /api/parent/invitations/:code
```

State rules:

- Link cannot complete unless parent verifies child association.
- Linked classroom profile remains the same learner profile.

### Screen 4: Child Course View

Route: `/dashboard`

UI features:

- Child course progress
- Continue assigned lesson
- Practice due
- Discover/StarPath only after allowed by parent/school policy

Backend contracts:

```http
GET /api/curriculum/levels
GET /api/classes/:classId/assignments
GET /api/progress/summary
```

### Screen 5: Family Reports

Route: `/reports`

UI features:

- Weekly summary
- Skills mastery
- Lesson evidence
- Review activity
- Export report button

Backend contracts:

```http
GET /api/reports/family
GET /api/reports/export?familyId=:familyId
```

### Screen 6: Subscription

Route: `/account/billing`

UI features:

- Current plan
- Child profile allowance
- Upgrade button
- Manage billing button

Backend contracts:

```http
GET  /api/billing/subscription
GET  /api/billing/plans
POST /api/billing/checkout
POST /api/billing/portal
```

Completion handoff:

```text
Child completes course milestone
→ Parent report updates
→ Certificate eligibility appears
→ Parent can view/export evidence
```

---

## 4. Educators and Classroom Teachers

### Pathway Summary

```text
Landing page
→ Educators and Classroom Teachers
→ Teacher signup
→ Email verification
→ Create/import classroom
→ Add roster
→ Assign course/lesson
→ Monitor lesson completion
→ Reports and exports
```

### Screen 1: Teacher Signup

Route: `/signup/teacher`

UI features:

- First name
- Last name
- School email
- Birth year
- Password
- Verification code

Backend contracts:

```http
POST /api/auth/register
POST /api/auth/verify-email
POST /api/teacher/profile
```

State rules:

- School email verification required before classroom creation.

### Screen 2: Teacher Dashboard

Route: `/teacher`

UI features:

- Class list
- Assignment status
- Learner progress alerts
- Quick create assignment
- Live classroom launcher

Backend contracts:

```http
GET /api/teacher/classes
GET /api/teacher/dashboard
GET /api/teacher/alerts
```

### Screen 3: Class and Roster

Route: `/teacher/classes`

UI features:

- Create class
- Import from spreadsheet
- Import from Google Classroom/Clever placeholder where provider unavailable
- Generate class code
- Generate login cards
- Manage student profiles

Backend contracts:

```http
POST /api/classes
GET  /api/classes/:id
POST /api/classes/:id/students
POST /api/classes/:id/import
GET  /api/classes/:id/login-cards
```

State rules:

- Imported/created students become junior classroom profiles.
- Class code required for junior student login.

### Screen 4: Assignments

Route: `/teacher/assignments`

UI features:

- Select class
- Select level/course/lesson
- Due date
- Assign button
- Assignment progress table

Backend contracts:

```http
GET  /api/curriculum/levels
GET  /api/curriculum/lessons
POST /api/assignments
GET  /api/assignments?classId=:classId
```

State rules:

- Assigned lesson becomes primary CTA on junior dashboard.
- Teacher can assign core lessons, review, and supported practice.

### Screen 5: Class Evidence

Route: `/teacher/reports`

UI features:

- Completion table
- Skill mastery
- Review due
- Export CSV/PDF
- Individual learner evidence

Backend contracts:

```http
GET /api/reports/class/:classId
GET /api/reports/learner/:learnerId
GET /api/reports/export?classId=:classId
```

### Screen 6: Live Lesson Participation

Route: `/classroom`

UI features:

- Start live session
- Participant list
- Current activity
- Send prompt
- End session

Backend contracts:

```http
POST /api/classroom/session
GET  /api/classroom/session/:id
POST /api/classroom/session/:id/prompt
POST /api/classroom/session/:id/end
```

Completion handoff:

```text
Teacher assigns lesson
→ Junior learner completes lesson
→ Progress saved
→ Teacher report updates
→ Parent report updates if linked
```

---

## 5. Schools and Educational Organisations

### Pathway Summary

```text
Landing page
→ Schools and Educational Organisations
→ School admin login/signup
→ Organisation dashboard
→ Seat/licence management
→ Teacher/class management
→ Reports and exports
→ Compliance evidence
```

### Screen 1: School Administration

Route: `/school`

UI features:

- Organisation overview
- Seat count
- Active teachers
- Active learners
- Usage summary
- Billing/licence status

Backend contracts:

```http
GET /api/school/organisation
GET /api/school/seats
GET /api/school/usage
GET /api/billing/subscription
```

### Screen 2: Staff and Roles

Route: `/school/staff`

UI features:

- Invite teacher
- Assign role
- Suspend user
- Audit activity

Backend contracts:

```http
GET  /api/school/staff
POST /api/school/staff/invite
PATCH /api/school/staff/:id/role
GET  /api/audit/logs
```

### Screen 3: Organisation Classes

Route: `/school/classes`

UI features:

- All classes
- Teacher owner
- Learner count
- Bulk roster import
- Export roster

Backend contracts:

```http
GET  /api/school/classes
POST /api/school/roster/import
GET  /api/school/roster/export
```

### Screen 4: School Reports

Route: `/school/reports`

UI features:

- Organisation completion
- CEFR distribution
- Class comparison
- Export compliance report

Backend contracts:

```http
GET /api/reports/school
GET /api/reports/export?scope=school
```

State rules:

- School admin cannot edit lesson content unless also granted Studio permissions.
- School reports aggregate teacher/class evidence.

Completion handoff:

```text
Learner completes course
→ Teacher evidence updates
→ School aggregate report updates
→ Certificate verification remains public by code
```

---

## 6. Online and Live Tutors

### Pathway Summary

```text
Landing page
→ Live Tutors
→ Tutor marketplace
→ Tutor profile
→ Booking
→ Payment/entitlement gate
→ Live room
→ Lesson notes
→ Learner progress handoff
```

### Screen 1: Tutor Marketplace

Route: `/tutors`

UI features:

- Tutor cards
- Filters: level, skill, availability, price, language
- Tutor profile preview
- Book lesson CTA

Backend contracts:

```http
GET /api/tutors
GET /api/tutors/:id
GET /api/tutors/:id/availability
```

State rules:

- Marketplace can be standalone.
- Tutor cards inside learner app route through configurable frontend URL variables.

### Screen 2: Booking

Route: `/tutors/:id/book`

UI features:

- Time slot selector
- Lesson focus
- Price summary
- Payment/entitlement notice
- Confirm booking

Backend contracts:

```http
POST /api/tutor/bookings
GET  /api/billing/subscription
POST /api/billing/checkout
```

State rules:

- Paid booking requires successful entitlement/payment.
- Booking cannot create live room until confirmed.

### Screen 3: Tutor Onboarding

Route: `/tutor`

UI features:

- Tutor profile setup
- Identity/KYC status
- Teaching skills
- Availability
- Payout setup

Backend contracts:

```http
POST /api/tutor/profile
GET  /api/tutor/verification/status
POST /api/tutor/availability
POST /api/billing/connect/onboard
```

Placeholder providers:

- KYC/background checks require provider integration.
- Payouts require Stripe Connect or equivalent.

### Screen 4: Live Room

Route: `/tutor/live/:bookingId`

UI features:

- Join video room
- Lesson notes
- Shared activity link
- End session
- Tutor feedback

Backend contracts:

```http
GET  /api/tutor/bookings/:bookingId
POST /api/live-room/:bookingId/token
POST /api/tutor/session/:bookingId/notes
POST /api/tutor/session/:bookingId/end
```

Placeholder providers:

- WebRTC room requires configured live video provider.

Completion handoff:

```text
Learner books tutor
→ Payment/entitlement confirmed
→ Live room opens
→ Tutor notes saved
→ Learner progress/support record updates
→ Learner returns to course spine
```

---

## 7. Studio and Content Creators

### Pathway Summary

```text
Landing page
→ Studio and Content Creator
→ Studio workspace
→ Create/import project
→ Author lesson
→ Validate CEFR/alignment
→ Review
→ Publish
→ Version/rollback controls
→ Course appears in assigned learner pathways
```

### Screen 1: Studio Workspace

Route: `/studio`

UI features:

- Project list
- Draft/review/published tabs
- Create project CTA
- Coursebook-to-Lesson CTA
- StarPath resources CTA
- AI governance CTA

Backend contracts:

```http
GET  /api/studio/projects
POST /api/studio/projects
GET  /api/studio/permissions
```

State rules:

- User must have Studio role.
- Drafts are private until review/publish.

### Screen 2: Author, Validate, Publish

Route: `/studio/project/:id`

UI features:

- Lesson builder
- Vocabulary editor
- Grammar editor
- Activity sequence editor
- Audio script editor
- Image brief editor
- CEFR validation panel
- Preview
- Submit for review
- Publish
- Version history

Backend contracts:

```http
GET   /api/studio/projects/:id
PATCH /api/studio/projects/:id
POST  /api/studio/projects/:id/validate
POST  /api/studio/projects/:id/review
POST  /api/studio/projects/:id/publish
GET   /api/studio/projects/:id/versions
POST  /api/studio/projects/:id/rollback
```

State rules:

- Draft can be edited.
- Review state locks critical curriculum fields except reviewer comments.
- Published version is immutable unless new version is created.

### Screen 3: Coursebook-to-Lesson Studio

Route: `/studio/coursebook`

UI features:

- Upload source material
- Extract unit/lesson structure
- Map to CEFR level
- Generate aims/outcomes
- Generate vocabulary cards
- Generate activity draft
- Human review required

Backend contracts:

```http
POST /api/studio/coursebook/upload
POST /api/studio/coursebook/extract
POST /api/studio/coursebook/generate-lesson
POST /api/studio/coursebook/approve
```

State rules:

- AI-generated lessons must remain draft until reviewed.
- Coursebook output cannot overwrite published lessons directly.

### Screen 4: StarPath Resources

Route: `/studio/starpath`

UI features:

- StarPath activity library
- Game template editor
- CEFR tag mapping
- Rewards tuning
- Publish to StarPath

Backend contracts:

```http
GET  /api/starpath/templates
POST /api/starpath/resources
POST /api/starpath/resources/:id/publish
GET  /api/starpath/resources/:id
```

### Screen 5: AI Governance

Route: `/studio/ai`

UI features:

- Prompt versions
- Moderation rules
- AI usage quotas
- Evaluation runs
- Safety logs

Backend contracts:

```http
GET  /api/ai/prompts
POST /api/ai/prompts
POST /api/ai/evals/run
GET  /api/ai/moderation/logs
GET  /api/ai/quotas
```

Completion handoff:

```text
Studio publishes content
→ Version is recorded
→ Curriculum catalogue updates
→ Teachers can assign
→ Learners can access through course spine
```

---

## 8. StarPath Standalone Enrichment

### Pathway Summary

```text
Landing page or learner dashboard
→ StarPath
→ Select mission
→ Play activity
→ Earn rewards
→ Save practice evidence
→ Return to course
```

Route: `/starpath`

UI features:

- Missions
- Skill worlds
- CEFR tags
- Game cards
- Rewards
- Streaks
- Back to My Course CTA

Backend contracts:

```http
GET  /api/starpath/missions
GET  /api/starpath/activities/:id
POST /api/starpath/attempts
POST /api/rewards/grant
GET  /api/rewards/summary
```

State rules:

- StarPath can appear as a standalone app.
- StarPath can also appear inside the core lesson player as a configured activity.
- StarPath never advances the required course lesson unless backend explicitly maps it as lesson evidence.

Completion handoff:

```text
Complete StarPath mission
→ Save attempt
→ Grant rewards
→ Update practice evidence
→ Return to My Course
```

---

## 9. Discovery Standalone Enrichment

### Pathway Summary

```text
Landing page or learner dashboard
→ Discover
→ Browse by level/topic/skill/latest/media/podcast
→ Complete micro-practice
→ Add to practice
→ Return to course
```

Route: `/discover`

UI features:

- Level filter: A1-C2
- Topic filter
- Skill filter
- Latest content feed
- Podcasts
- Authentic media cards
- Transcript view
- Vocabulary highlights
- Add to My Practice button
- Back to My Course button

Backend contracts:

```http
GET  /api/discovery
GET  /api/discovery?level=:level
GET  /api/discovery?topic=:topic
GET  /api/discovery?skill=:skill
GET  /api/discovery/:id
POST /api/discovery/:id/attempt
POST /api/practice/add
```

State rules:

- Discovery content is optional.
- Discovery must be CEFR-tagged.
- Discovery progress appears as enrichment activity, not core course completion.

Completion handoff:

```text
Complete Discovery item
→ Save enrichment evidence
→ Optional add-to-practice
→ Return to course spine
```

---

## 10. Referral and Partner Dashboard

### Pathway Summary

```text
Landing page or account menu
→ Referral dashboard
→ Generate referral link
→ Track signups
→ Track commissions
→ Payout setup
```

Route: `/partners` or `/referrals`

UI features:

- Referral link
- Invite cards
- Signup tracking
- Commission status
- Payout status
- Terms notice

Backend contracts:

```http
GET  /api/partners/me
POST /api/partners/referral-link
GET  /api/partners/referrals
GET  /api/partners/commissions
POST /api/billing/connect/onboard
```

State rules:

- Real payouts require configured payout provider.
- Commissions remain pending until backend confirms eligible transaction.

Completion handoff:

```text
Referral converts
→ Commission event created
→ Eligibility confirmed
→ Payout queued
```

---

## 11. Global Payment Gates

Payment gates can appear in:

- Parent subscription
- School licensing
- Tutor booking
- Premium certificates
- Premium course access
- Premium StarPath/Discovery packs

Backend contracts:

```http
GET  /api/billing/plans
GET  /api/billing/subscription
POST /api/billing/checkout
POST /api/billing/portal
POST /api/billing/webhook
```

UI states:

| State | UI |
---|---|
| Free | Show available content and upgrade CTA |
| Trial | Show trial days remaining |
| Premium | Unlock premium content |
| Past due | Show billing issue CTA |
| School licensed | Hide individual payment CTA |
| Parent-managed | Show parent billing notice |

---

## 12. Global Certificate Rules

Certificate UI routes:

```text
/certificates
/certificates/verify/:code
```

Backend contracts:

```http
GET  /api/certificates
POST /api/certificates/issue
GET  /api/certificates/verify/:code
```

State rules:

- Certificate issue requires backend eligibility.
- Public verification must not require learner login.
- Certificate screen appears after eligible course/level completion.

---

## 13. Global Course Completion Model

Course completion must be written once by the backend and surfaced across all relevant accounts.

Completion event:

```http
POST /api/progress/lesson
```

Completion effects:

- Learner dashboard updates.
- Parent report updates if child linked.
- Teacher report updates if classroom assigned.
- School aggregate report updates if organisation linked.
- Review queue updates.
- Rewards update.
- Certificate eligibility recalculates.

Required data:

```ts
type CompletionEvent = {
  learnerId: string;
  lessonId: string;
  courseId: string;
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  score: number;
  mastery: number;
  completedAt: string;
  evidenceSource: "core_lesson" | "teacher_assignment" | "starpath_mapped" | "discovery_enrichment" | "tutor_session";
};
```

---

## 14. Frontend Adapter Naming

Engineers should centralise all calls through frontend adapters.

```ts
authApi.studentLogin()
authApi.register()
parentApi.getChildren()
parentApi.linkChild()
teacherApi.getClasses()
teacherApi.createClass()
teacherApi.importRoster()
teacherApi.createAssignment()
schoolApi.getOrganisation()
schoolApi.getReports()
tutorApi.listTutors()
tutorApi.createBooking()
tutorApi.createLiveRoomToken()
studioApi.listProjects()
studioApi.validateProject()
studioApi.publishProject()
coursebookApi.upload()
coursebookApi.generateLesson()
starpathApi.listMissions()
starpathApi.submitAttempt()
discoveryApi.list()
discoveryApi.submitAttempt()
progressApi.getSummary()
progressApi.completeLesson()
reportsApi.export()
certificatesApi.verify()
billingApi.checkout()
```

---

## 15. Implementation Guardrails

- Do not duplicate backend routes in frontend files.
- Do not hardcode production URLs; use environment variables.
- Do not let StarPath or Discover replace course completion logic.
- Do not allow junior independent registration.
- Do not expose KYC, payment, OpenAI, Azure, ElevenLabs, or WebRTC secrets in the frontend.
- Do not issue certificates in the frontend.
- Do not treat enrichment completion as level completion unless backend explicitly marks it as mapped evidence.
- Do not alter account labels:
  - Junior Learners under 12
  - Parents and Guardians
  - Educators and Classroom Teachers
  - Online and Live Tutors
  - Schools and Educational Organisations
  - Studio and Content Creator

---

## 16. Environment Variables

```env
VITE_API_BASE_URL=https://eilps.com/api
VITE_CONTENT_ASSET_ORIGIN=https://eilps.com/content-assets
VITE_TUTOR_APP_URL=https://eilps.com/tutors
VITE_STARPATH_APP_URL=https://eilps.com/starpath
VITE_DISCOVERY_URL=https://eilps.com/discover
VITE_CERTIFICATE_VERIFY_URL=https://eilps.com/certificates/verify
```

---

## 17. Final Pathway Matrix

| Account Type | Entry | Workspace | Core Completion Link | Evidence |
|---|---|---|---|---|
| Junior | `/student-login` | `/dashboard` | assigned lesson completion | progress, teacher report, parent report |
| Parent | `/signup/parent` | `/parent` | child completion | family reports, billing, certificates |
| Teacher | `/signup/teacher` | `/teacher` | assigned student completion | class reports, exports |
| School | `/school` | `/school` | organisation learner completion | aggregate reports, compliance exports |
| Tutor | `/tutors`, `/tutor` | `/tutor` | support session evidence | booking notes, learner support record |
| Studio | `/studio` | `/studio` | published content available to learners | versions, validation, publish log |
| StarPath | `/starpath` | `/starpath` | optional/mapped practice | rewards, practice evidence |
| Discovery | `/discover` | `/discover` | optional enrichment | media activity, practice add-ons |
| Referral | `/partners` | `/partners` | referral conversion | commission and payout events |


---

## Appendix A. Live Route Corrections (verified 2026-08-10)

Every route below was checked against the running EILPS API. The rule is the one
you set: the frontend adapts to the real server routes. Do not add backend routes
to match the older names in this document.

Three corrections are already applied inline throughout the spec:

| Was in this spec | Real live route |
|---|---|
| `POST /api/progress/lesson-complete` | `POST /api/progress/lesson` |
| `GET /api/lessons/:lessonId` | `GET /api/curriculum/deep-catalog` |
| `POST /api/activities/attempts` | `POST /api/activities/:lessonId/submissions` |

The remaining differences are listed below so the pathway sections can be read
against the real API. "Not available" means there is no equivalent on the server
today and the feature needs either a backend addition or a design change.

### A.1 Core / auth / curriculum

| Spec route | Real route |
|---|---|
| `GET /api/me` | `GET /api/auth/me` |
| `POST /api/auth/verify-email` | `POST /api/auth/email-verification/request` then `/confirm` |
| `GET /api/curriculum/levels` | `GET /api/curriculum` |
| `GET /api/curriculum/lessons` | `GET /api/curriculum/deep-catalog` |
| `GET /api/audio/lesson/:lessonId/manifest` | `GET /api/resources/starfall-splashlearn/audio-scripts/:lessonId` |
| `GET /api/audio/review/manifest` | Not available |
| `GET /api/health` | Not available under `/api` |

### A.2 Progress, review and rewards

| Spec route | Real route |
|---|---|
| `GET /api/progress/summary` | `GET /api/progress` |
| `POST /api/review/results` | `POST /api/review/attempts` |
| `POST /api/practice/add` | `POST /api/review/saved-phrase` |
| `GET /api/rewards/summary` | `GET /api/gamification/profile` |
| `POST /api/rewards/grant` | Not available — rewards are server-awarded by `POST /api/progress/lesson` |
| `GET /api/certificates` | `GET /api/certificates/eligibility/:level` |
| `POST /api/certificates/issue` | `POST /api/certificates/:level` |
| `GET /api/placement/options` | `GET /api/assessment/level-check` |

### A.3 Parents

| Spec route | Real route |
|---|---|
| `GET /api/parent/children` | `GET /api/school/parent/dashboard` |
| `POST /api/parent/link-child` | `POST /api/school/parent/links`, then `POST /api/school/parent/links/confirm` |
| `GET /api/parent/invitations/:code` | Not available — confirm the code via `/links/confirm` |
| `GET /api/reports/family` | `GET /api/school/parent/dashboard` |

### A.4 Teachers and classes

| Spec route | Real route |
|---|---|
| `GET /api/teacher/dashboard` | `GET /api/school/dashboard` |
| `GET /api/teacher/classes` | `GET /api/school/classes` |
| `GET /api/teacher/alerts` | `GET /api/school/moderation` |
| `POST /api/teacher/profile` | `PATCH /api/auth/me` |
| `GET /api/classes/:id` | `GET /api/school/classes/:id` |
| `POST /api/classes` | `POST /api/school/classes` |
| `POST /api/classes/:id/students` | `POST /api/school/classes/:id/members` |
| `POST /api/classes/:id/import` | `POST /api/school/classes/:id/bulk-import` |
| `GET /api/classes/:id/login-cards` | Not available — create logins with `POST /api/auth/student-profiles` |
| `GET /api/assignments`, `GET /api/classes/:classId/assignments` | `GET /api/school/assignments/:id` |
| `POST /api/assignments` | `POST /api/school/classes/:id/assignments` |
| `GET /api/reports/class/:classId` | `GET /api/school/classes/:id/report` |
| `GET /api/reports/export` | `GET /api/school/classes/:id/export` |
| `GET /api/reports/learner/:learnerId` | Not available — use the class report |
| `GET /api/reports/school` | `GET /api/school/admin/overview` |

### A.5 Schools and organisations

| Spec route | Real route |
|---|---|
| `GET /api/school/organisation` | `GET /api/school/admin/overview` |
| `GET /api/school/seats`, `GET /api/school/usage` | `GET /api/school/organizations/:id/seat-usage` |
| `GET /api/school/staff` | Not available as a list — membership is written with `POST /api/school/organizations/:id/members` |
| `POST /api/school/staff/invite` | `POST /api/school/organizations/:id/members` |
| `PATCH /api/school/staff/:id/role` | Not available |
| `GET /api/school/roster/export` | `GET /api/school/organizations/:id/export` |
| `POST /api/school/roster/import` | `POST /api/school/roster-sync` |
| `GET /api/audit/logs` | `GET /api/school/audit-logs` |

Note the spelling: the server uses `organizations`, not `organisation`.

### A.6 Live classroom

| Spec route | Real route |
|---|---|
| `POST /api/classroom/session` | `POST /api/classroom/sessions` |
| `POST /api/classroom/session/:id/join` | `POST /api/classroom/sessions/:id/token` |
| `POST /api/classroom/session/:id/activity` | `POST /api/classroom/sessions/:id/events` |
| `POST /api/classroom/session/:id/prompt` | `POST /api/classroom/sessions/:id/events` |
| `POST /api/classroom/session/:id/end` | `POST /api/classroom/sessions/:id/events` |
| `GET /api/classroom/session/:id` | `GET /api/classroom/sessions/:id/review` |
| `GET /api/classroom/session/current` | Not available |
| `GET /api/classroom/code/:classCode` | Not available — students join with `POST /api/auth/student-login` |

### A.7 Live tutors

| Spec route | Real route |
|---|---|
| `GET /api/tutors` | `GET /api/tutoring/tutors` |
| `GET /api/tutors/:id` | Not available individually — read from the list |
| `GET /api/tutors/:id/availability` | `GET /api/tutoring/tutors/:id/availability` |
| `POST /api/tutor/bookings` | `POST /api/tutoring/bookings` |
| `GET /api/tutor/bookings/:bookingId` | `GET /api/tutoring/bookings` |
| `POST /api/live-room/:bookingId/token` | `POST /api/tutoring/bookings/:id/room`, then `POST /api/tutoring/bookings/:id/join` |
| `POST /api/tutor/profile` | `POST /api/tutoring/application` |
| `POST /api/tutor/availability` | `POST /api/tutoring/application/availability` |
| `GET /api/tutor/verification/status` | `GET /api/tutoring/application` |
| `POST /api/tutor/session/:bookingId/end` | Not available |
| `POST /api/tutor/session/:bookingId/notes` | Not available |

The `/api/tutor/*` namespace is the AI coach, not the human tutor. Human tutoring
lives under `/api/tutoring/*`. Keeping these apart matters — mixing them is the
easiest mistake to make in this area.

### A.8 StarPath

| Spec route | Real route |
|---|---|
| `GET /api/starpath/missions` | `GET /api/addons/starpath/assignments` |
| `GET /api/starpath/templates` | `GET /api/addons/starpath/meta` |
| `GET /api/starpath/activities/:id`, `GET /api/starpath/resources/:id` | `GET /api/addons/starpath/resources` |
| `POST /api/starpath/resources` | `POST /api/addons/starpath/assignments` |
| `POST /api/starpath/resources/:id/publish` | `POST /api/addons/starpath/resources/:id/save` |
| `POST /api/starpath/attempts` | `POST /api/engine/attempts` |

### A.9 Studio and authoring

| Spec route | Real route |
|---|---|
| `GET /api/studio/projects` | `GET /api/authoring/projects` |
| `GET /api/studio/projects/:id` | `GET /api/authoring/projects/:id` |
| `POST /api/studio/projects` | `POST /api/authoring/projects` |
| `PATCH /api/studio/projects/:id` | `POST /api/authoring/projects/:id/blocks` |
| `POST /api/studio/projects/:id/validate` | `POST /api/authoring/projects/:id/validate` |
| `POST /api/studio/projects/:id/publish` | `POST /api/authoring/projects/:id/publish` |
| `GET /api/studio/projects/:id/versions` | `GET /api/school/content/:id/versions` |
| `POST /api/studio/projects/:id/rollback` | `POST /api/school/content/:id/rollback` |
| `POST /api/studio/projects/:id/review` | Not available |
| `GET /api/studio/permissions` | `GET /api/auth/me` — read the `role` field |
| `POST /api/studio/coursebook/upload` | `POST /api/studio/coursebook/projects/:projectId/uploads/pdf` or `/uploads/text` |
| `POST /api/studio/coursebook/extract` | `POST /api/studio/coursebook/projects/:projectId/generations` |
| `POST /api/studio/coursebook/generate-lesson` | `POST /api/studio/coursebook/projects/:projectId/generations` |
| `POST /api/studio/coursebook/approve` | `POST /api/studio/coursebook/generations/:id/apply`, then `/live` |

### A.10 AI operations and partners

| Spec route | Real route |
|---|---|
| `GET /api/ai/prompts`, `POST /api/ai/prompts` | `GET`/`POST /api/tutor/admin/prompts` |
| `GET /api/ai/quotas` | `GET /api/tutor/quota` |
| `GET /api/ai/moderation/logs` | `GET /api/activities/moderation`, `GET /api/practice/moderation`, `GET /api/school/moderation` |
| `POST /api/ai/evals/run` | `POST /api/tutor/admin/prompts/:id/evaluate` |
| `GET /api/partners/me`, `/referrals`, `/commissions` | `GET /api/partners/dashboard` |
| `POST /api/partners/referral-link` | `POST /api/partners/links` |

---

## Appendix B. Verified Lesson Completion Contract (verified 2026-08-10)

This replaces the single-call completion model in section 13. Completion for
canonical A1–C2 lessons is a two-call chain, and the second call will not accept
a client-computed score.

### B.1 The chain

```http
1. POST /api/activities/:lessonId/submissions
   { "clientSubmissionId": "<^[a-zA-Z0-9_-]{8,80}$>",
     "attempts": [ { "screenId": "...", "responseMs": 20000, "evidence": { ... } } ] }
   -> 201 { "submission": { "id", "score", "maxScore", "accuracy", "stars",
                            "status", "moderationRequired",
                            "completedEvents", "missingEvents", "results" } }

2. POST /api/progress/lesson
   { "lessonId": "...", "submissionId": "<submission.id from step 1>" }
   -> 200 { "state", "stars", "accuracy", "scheduledReviewItems",
            "evidenceSource": "verified_interactive_activity",
            "verifiedSubmissionId", "firstCompletion", "improved", "rewards" }
```

Calling step 2 without a `submissionId` returns
`422 verified_submission_required`. That is the integrity rule working as
designed, not a bug.

For canonical lessons the server **ignores** any `accuracy` the client sends and
uses the score it computed in step 1. The frontend must not calculate a score.

### B.2 Where the screens come from

```http
GET /api/resources/starfall-splashlearn/lessons/:lessonId
-> { activity: { activity_id, lesson_id, level, unit_id, progress_rules, screens: [...] } }
```

Each lesson has nine scored screens. Every screen carries its own `screen_id`,
`mechanic`, `points`, `completion_event`, and the data the learner works with.

### B.3 Evidence shape per mechanic

| `mechanic` | `evidence` payload |
|---|---|
| `tap_the_lesson_words` | `{ selectedItems: string[] }` — must match `correct_items` as a set |
| `dialogue_sequence_builder` | `{ orderedCards: number[] }` — the `order` values in learner order |
| `multiple_choice_meaning` | `{ selectedOptionId: "A" }` |
| `multiple_choice_form_control` | `{ selectedOptionId: "A" }` |
| `drag_to_build_model_phrase` | `{ builtTiles: string[] }` — `target_tiles` in learner order |
| `listen_repeat_self_check` | `{ selfChecks: { "<self_check line>": true } }` — an object keyed by the exact text |
| `speaking_or_writing_transfer` | `{ responseText: "..." }` |
| `save_phrase_to_review_deck` | `{ savedReviewItemId: "<id>" }` |

Any other key is discarded by the server's sanitiser. Punctuation and case are
normalised on both sides, so tiles may be sent exactly as `target_tiles`.

### B.4 The two screens that cannot be faked

**Smart Review** ignores a `reviewSaved` flag. The learner must genuinely save
the phrase first:

```http
POST /api/review/saved-phrase
{ "lessonId", "phrase", "level", "unitId", "tags" }
-> 201 { "item": { "id": "saved-<lessonId>-<hash>" } }
```

Pass that `item.id` as `savedReviewItemId`. The server checks the row exists in
the learner's own review deck before awarding the points.

**Transfer response** is checked against the screen's `anti_gaming` block:
a minimum unique-word count, a minimum number of required words, and a Jaccard
similarity ceiling against the model line so the model answer cannot be copied
back. It always sets `moderationRequired`.

### B.5 Status and gating

- `status` is `incomplete`, `complete_pending_review`, or `complete`.
  `POST /api/progress/lesson` rejects `incomplete` submissions.
- `completed_when` in `progress_rules` drives `missingEvents`; completion is
  gated on events, not on the score.
- `minimum_accuracy` in `progress_rules` is already `0.7`.
- `clientSubmissionId` is idempotent — resending one returns the original
  submission rather than creating a second.
- The route requires the `premium_curriculum` entitlement; without it the
  server answers `402 upgrade_required`.

### B.6 Verified end to end

Adult demo account, lesson `a1d01l1`, all nine screens answered correctly:
score 104/106, accuracy 0.9811, 3 stars, `status: complete_pending_review`,
`missingEvents: []`. `POST /api/progress/lesson` then returned 200 with 3 stars,
8 review items scheduled and `evidenceSource: verified_interactive_activity`.
