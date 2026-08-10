# Tutor Live Classroom Sequence

## Frontend Routes

```text
/tutors
/tutors/:tutorId
/tutors/:tutorId/book
/tutor
/tutor/onboarding
/tutor/schedule
/tutor/live/:bookingId
/tutor/session/:bookingId/summary
/progress
/dashboard
```

## Sequence Table

| Step | Screen | User | UI Function | Backend |
|---|---|---|---|---|
| 1 | Tutor marketplace | Learner/parent | Browse tutors by level, skill, price, availability | `GET /api/tutors` |
| 2 | Tutor profile | Learner/parent | View tutor bio, levels, teaching focus, availability | `GET /api/tutors/:id` |
| 3 | Availability | Learner/parent | Pick date/time slot | `GET /api/tutors/:id/availability` |
| 4 | Booking details | Learner/parent | Choose lesson focus, learner, notes | local state + booking payload |
| 5 | Payment gate | Learner/parent | Check entitlement or start checkout | `GET /api/billing/subscription`, `POST /api/billing/checkout` |
| 6 | Confirm booking | Learner/parent | Save booking | `POST /api/tutor/bookings` |
| 7 | Tutor schedule | Tutor | See upcoming bookings | `GET /api/tutor/bookings` |
| 8 | Live lobby | Learner/tutor | Pre-call checks, camera/mic status | `GET /api/tutor/bookings/:bookingId` |
| 9 | Join room | Learner/tutor | Request secure video token | `POST /api/live-room/:bookingId/token` |
| 10 | Live classroom | Learner/tutor | Video, chat, shared lesson, activity link | WebRTC provider token |
| 11 | Session notes | Tutor | Add notes, strengths, next steps | `POST /api/tutor/session/:bookingId/notes` |
| 12 | End session | Tutor | Close lesson and save support evidence | `POST /api/tutor/session/:bookingId/end` |
| 13 | Learner evidence | Learner/parent/teacher | View session summary | `GET /api/progress/summary` |
| 14 | Return to course | Learner | Continue required IELPS lesson | `/dashboard` or `/learner?lesson=:id` |

## Screen Requirements

### Marketplace

- Tutor cards
- Level filter
- Skill filter
- Availability filter
- Price filter
- Book CTA
- Standalone handoff support from core IELPS app

### Tutor Profile

- Bio
- Levels taught
- Skills taught
- Availability
- Verification state
- Reviews/testimonials if available
- Book lesson CTA

### Booking

- Learner selector
- Lesson focus
- Time slot
- Price
- Entitlement/payment status
- Confirm CTA

### Live Lobby

- Booking time
- Tutor/learner names
- Camera check
- Microphone check
- Join room CTA
- Support fallback
- No WebRTC token until booking is confirmed

### Live Classroom

- Video area
- Captions/chat
- Shared lesson/activity link
- Timer
- End session button
- Safety/report button

### Session Summary

- Tutor notes
- Learner strengths
- Suggested practice
- Return to course CTA

## Completion Handoff

```text
Live session completed
→ tutor notes saved
→ support evidence attached to learner profile
→ suggested practice shown
→ learner returns to dashboard
→ next required course lesson remains primary CTA
```

