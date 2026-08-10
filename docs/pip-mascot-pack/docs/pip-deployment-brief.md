# PiP Deployment Brief

## Purpose

PiP is the IELPS multilingual platform guide and learning-support mascot. PiP helps users choose the right account pathway, understand the current screen, find the next action, and return to the core A1-C2 course spine.

PiP is not a grading engine, completion engine, or admin data viewer.

## Placement

```text
Public landing pages: bottom-right floating launcher
Dashboard pages: bottom-right or sidebar helper
Lesson player: Ask PiP support action
Studio: Studio help
Junior mode: only if parent/school policy allows
```

## Language Behaviour

```text
Manual user choice
→ browser Accept-Language
→ Cloudflare country/IP headers
→ English fallback
```

PiP should greet users in their likely language, then guide them back toward English learning where appropriate.

Supported initial languages:

```text
English, Spanish, Arabic, Chinese, French, Portuguese
```

## Pathway Functions

Junior:

```text
Class-code help
QR login help
Assigned lesson help
Safe review help
No billing/tutor/studio/school admin actions
```

Parent:

```text
Child profile linking
Family dashboard guidance
Reports
Billing/subscription
```

Teacher:

```text
Class creation
Roster guidance
Assignment guidance
Report/export guidance
```

School:

```text
Seats
Staff roles
Rosters
Reports
Compliance exports
```

Studio:

```text
Projects
Coursebook-to-Lesson
Validation
Publishing
AI governance summaries
Admin-only states where required
```

Tutor:

```text
Onboarding
Availability
Bookings
Live classroom
Session notes
```

Learner:

```text
Continue course
Practice
Discover
StarPath
Speaking
Progress
Certificates
```

## Integration Rules

```text
PiP must not replace the course spine.
PiP must not mark lessons complete.
PiP must not compute scores.
PiP must not expose admin-only data.
PiP must not expose AI prompts or secrets.
PiP must not collect private sensitive data.
PiP must obey junior safety policy.
```

## Deployment Checklist

```text
GET /api/agent/config returns supported languages and common paths.
POST /api/agent/chat works by route and role.
POST /api/agent/voice returns cached audio when present.
Cloudflare country/IP headers are forwarded to backend.
Accept-Language is passed from browser.
Manual language override works.
Arabic RTL captions render correctly.
Chinese captions render correctly.
Audio play/pause works.
PiP route suggestions do not break auth guards.
Junior mode hides unsafe actions.
No frontend API keys.
No prompt templates exposed.
No console errors.
```

