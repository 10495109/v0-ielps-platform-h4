# IELPS Integrity Rules

These four rules are binding for this codebase. They exist because lesson
completion is academic evidence: it feeds mastery, review scheduling, parent and
teacher reports, and certificate eligibility. A completion that was not earned
corrupts all of them.

Anything that breaks a rule below should be treated as a bug, not a preference,
and should not be merged.

---

## 1. No invented client score

The client never calculates a grade and never sends one that the server will
trust. For canonical A1–C2 lessons the server rescores the submitted evidence
and **overwrites** any `accuracy` in the request body, so a client-side score is
at best ignored and at worst misleading in the UI.

- Scoring lives server-side in `activity_scoring.js`.
- The completion screen displays `submission.accuracy`, `submission.score` and
  `submission.stars` as returned by the server — see `components/lesson-player/completion.tsx`.
- The engine does not compute a grade for lessons that have a scored activity:
  `finishLesson()` in `components/lesson-player/use-lesson-engine.ts`.

The one exception is a lesson with no scored activity at all, which falls back to
the older single-call route. If every lesson gains an activity, that branch
should be deleted.

## 2. No duplicate backend routes

The frontend adapts to the routes the server actually exposes. We do not add a
backend route so that an older document or an older adapter keeps working.

- Lesson content: `GET /api/curriculum/deep-catalog` — there is no `/api/lessons/:id`.
- Completion: `POST /api/progress/lesson` — there is no `/api/progress/lesson-complete`.
- Evidence: `POST /api/activities/:lessonId/submissions` — there is no `/api/activities/attempts`.

Where a spec disagrees with the server, the spec is corrected. See Appendix A of
the pathways developer spec for the full old-name to real-name mapping.

## 3. No self-reported Smart Review

Saving a phrase to the review deck is proven, not claimed. The client cannot set
a "saved" flag and have it believed.

- The learner's save goes to `POST /api/review/saved-phrase`, which returns the
  created `item.id`.
- That id is submitted as `evidence.savedReviewItemId`.
- The server re-checks the row exists in **that learner's** `user_review_memory`
  before awarding the screen, and overwrites the flag with what it finds.

See `savePhraseToReview()` in `lib/activity-adapter.ts`. Do not add a local
`reviewSaved: true` shortcut — the server discards it.

## 4. Use server submissionId only

Completion is a two-call chain, and the second call is only valid with an id the
server issued for that learner and that lesson.

```
POST /api/activities/:lessonId/submissions   ->  submission.id
POST /api/progress/lesson { lessonId, submissionId }
```

- Calling the second alone returns `422 verified_submission_required`.
- A submission belonging to another lesson or another learner, or one still
  `incomplete`, returns `422 invalid_verified_submission`.
- `clientSubmissionId` is an idempotency key matching `^[a-zA-Z0-9_-]{8,80}$`;
  resending one returns the original submission rather than creating a second.

Never synthesise, cache across lessons, or reuse a `submissionId` from anywhere
other than the response to the submission for the lesson being completed.

---

## Where the evidence shapes are defined

Screen definitions come from `GET /api/resources/starfall-splashlearn/lessons/:lessonId`.
The server keeps only these `evidence` keys and discards everything else:

| mechanic | evidence |
|---|---|
| `tap_the_lesson_words` | `selectedItems: string[]` |
| `dialogue_sequence_builder` | `orderedCards: number[]` |
| `multiple_choice_meaning` | `selectedOptionId: string` |
| `multiple_choice_form_control` | `selectedOptionId: string` |
| `drag_to_build_model_phrase` | `builtTiles: string[]` |
| `listen_repeat_self_check` | `selfChecks: Record<string, boolean>` |
| `speaking_or_writing_transfer` | `responseText: string` |
| `save_phrase_to_review_deck` | `savedReviewItemId: string` |

Two screens are deliberately not auto-passable: the listen-and-repeat self check
is confirmed by the learner then reviewed by a teacher, and the transfer response
is checked for a minimum unique-word count, a minimum number of target words, and
a similarity ceiling against the model line so the model answer cannot be copied
back. Both set `moderationRequired`.
