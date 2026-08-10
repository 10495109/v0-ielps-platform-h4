# Tutor Live Classroom Required Guards

## Payment and Entitlement

```text
No confirmed paid booking without entitlement or successful payment.
No WebRTC room token until booking state is confirmed or lobby_open.
No payout without approved tutor status.
```

## Privacy and Role Access

```text
Learner data must only be visible to:
- the booked tutor
- the learner
- linked parent/guardian when applicable
- assigned teacher/school only when policy allows

Unrelated tutors must never see learner progress, notes, or parent details.
```

## Course Completion

```text
Tutor session evidence is support evidence only.
Tutor cannot mark a core lesson complete.
Core lesson completion must still use the server-scored IELPS lesson pipeline.
Learner returns to the A1-C2 course spine after the session.
```

## Safeguarding

```text
No under-12 live session unless parent/school policy allows it.
Tutor must be approved before teaching.
KYC and background states must not be faked.
If provider data is unavailable, show pending/unavailable honestly.
Safety/report action must be visible in the live classroom.
```

## WebRTC Provider

```text
The frontend must not create live provider rooms directly.
The backend must issue participant-scoped live room tokens.
Tokens must expire.
Tokens must be booking-specific.
```

## UI Truthfulness

```text
Live = rendered from real server data.
Sample = placeholder.
Admin only = real endpoint exists but current role is blocked.
Unavailable = endpoint/provider missing or not configured.
```

