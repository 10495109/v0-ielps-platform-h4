# IELPS Tutor Live Classroom Developer Pack

Generated: 2026-08-10

Scope: Developer-ready sequence, pathway, state model, UI screen map, endpoint contracts, safety guards, and implementation notes for Tutor Live Classroom.

No live platform, backend, server, deployment, colour, layout, or branding changes are included in this package.

## Files

- `tutor-live-classroom-sequence.md` - full pathway from marketplace to live classroom completion.
- `tutor-live-classroom-endpoints.json` - route and endpoint contract map.
- `tutor-live-classroom-state-machine.json` - booking, onboarding, live room, and completion states.
- `tutor-live-classroom-types.ts` - TypeScript-ready interfaces.
- `tutor-live-classroom-guards.md` - required privacy, payment, safeguarding, and evidence rules.

## Primary Flow

```text
Landing page
→ Online and Live Tutors
→ Tutor marketplace
→ Tutor profile
→ Booking
→ Payment / entitlement check
→ Confirmed lesson
→ Live classroom lobby
→ Live classroom session
→ Tutor notes and learner evidence
→ Progress/support record
→ Learner returns to course spine
```

