import { authFetch } from '@/lib/eilps-auth'

/**
 * Verified interactive activity — the real completion contract.
 *
 * Canonical A1–C2 lessons are not completed by posting a client-side score.
 * The server scores a submission of learner evidence, and only that submission
 * unlocks completion:
 *
 *   1. POST /api/activities/:lessonId/submissions  -> submission.id
 *   2. POST /api/progress/lesson { lessonId, submissionId }
 *
 * Calling step 2 alone answers 422 verified_submission_required. The server
 * ignores any accuracy the client sends for these lessons and uses the score it
 * calculated in step 1, so nothing here computes a grade.
 *
 * Screen definitions come from the resources API; each lesson has nine scored
 * screens, each with its own mechanic and its own evidence shape.
 */

export const ACTIVITY_PATH = '/api/resources/starfall-splashlearn/lessons'

export type ActivityMechanic =
  | 'tap_the_lesson_words'
  | 'dialogue_sequence_builder'
  | 'multiple_choice_meaning'
  | 'multiple_choice_form_control'
  | 'drag_to_build_model_phrase'
  | 'listen_repeat_self_check'
  | 'speaking_or_writing_transfer'
  | 'save_phrase_to_review_deck'

export type ActivityOption = { id: string; text: string }
export type DialogueCard = { order: number; speaker: string; text: string }

export type ActivityScreen = {
  screen_id: string
  mechanic: ActivityMechanic
  learner_title?: string
  instruction?: string
  points?: number
  completion_event?: string
  feedback_correct?: string
  feedback_incorrect?: string
  adaptive_hint?: string
  /** tap_the_lesson_words */
  correct_items?: string[]
  distractor_items?: string[]
  /** dialogue_sequence_builder */
  dialogue_cards?: DialogueCard[]
  /** multiple_choice_* */
  question?: string
  options?: ActivityOption[]
  correct_option_id?: string
  rationale?: string
  /** drag_to_build_model_phrase */
  target_phrase?: string
  target_tiles?: string[]
  shuffled_tiles?: string[]
  /** listen_repeat_self_check */
  model_line?: string
  self_check?: string[]
  pronunciation_focus?: string[]
  /** speaking_or_writing_transfer */
  speaking_task?: string
  writing_task?: string
  required_words?: string[]
  anti_gaming?: {
    min_unique_words?: number
    must_use_required_words?: number
    reject_copy_of_model?: boolean
  }
  /** save_phrase_to_review_deck */
  suggested_phrase?: string
  review_tags?: string[]
}

export type Activity = {
  activity_id: string
  lesson_id: string
  level: string
  unit_id?: string
  title?: string
  duration_target_minutes?: number
  screens: ActivityScreen[]
  progress_rules?: Record<string, unknown>
}

/** Exactly the keys the server's sanitiser keeps. Anything else is discarded. */
export type Evidence = {
  selectedItems?: string[]
  selectedOptionId?: string
  builtTiles?: string[]
  orderedCards?: number[]
  selfChecks?: Record<string, boolean>
  responseText?: string
  savedReviewItemId?: string
}

export type ScreenResult = {
  screenId: string
  mechanic: string
  completionEvent: string
  pointsAvailable: number
  score: number
  correct: boolean
  complete: boolean
  verified: boolean
  moderationRequired: boolean
  reason: string | null
}

export type Submission = {
  id: string
  lessonId: string
  score: number
  maxScore: number
  accuracy: number
  stars: number
  status: 'incomplete' | 'complete_pending_review' | 'complete'
  completed: boolean
  moderationRequired: boolean
  completedEvents: string[]
  missingEvents: string[]
  results: ScreenResult[]
}

export async function fetchActivity(lessonId: string): Promise<Activity> {
  const res = await authFetch(`${ACTIVITY_PATH}/${encodeURIComponent(lessonId)}`)
  if (!res.ok) throw new Error(`activity ${res.status}`)
  const data = await res.json()
  const activity = data?.activity
  if (!activity?.screens?.length) throw new Error('activity has no screens')
  return activity as Activity
}

/**
 * Saves a phrase into the learner's own review deck and returns the item id.
 * Smart Review cannot be self-reported: the server re-checks that this id really
 * exists for this learner before awarding the screen, so the save must be real.
 */
export async function savePhraseToReview(
  activity: Activity,
  screen: ActivityScreen,
  phrase: string,
): Promise<string | null> {
  const res = await authFetch('/api/review/saved-phrase', {
    method: 'POST',
    body: JSON.stringify({
      lessonId: activity.lesson_id,
      phrase,
      level: activity.level,
      unitId: activity.unit_id,
      tags: screen.review_tags ?? [],
    }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return typeof data?.item?.id === 'string' ? data.item.id : null
}

/** The server requires ^[a-zA-Z0-9_-]{8,80}$ and treats it as an idempotency key. */
export function clientSubmissionId(lessonId: string, startedAt: number): string {
  return `ielps-${lessonId}-${startedAt}`.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80)
}

export type SubmitResult =
  | { ok: true; submission: Submission }
  | { ok: false; status: number; reason?: string }

export async function submitActivity(
  activity: Activity,
  evidenceByScreen: Record<string, Evidence>,
  submissionKey: string,
): Promise<SubmitResult> {
  const attempts = activity.screens.map((screen) => ({
    screenId: screen.screen_id,
    evidence: evidenceByScreen[screen.screen_id] ?? {},
  }))
  const res = await authFetch(`/api/activities/${encodeURIComponent(activity.lesson_id)}/submissions`, {
    method: 'POST',
    body: JSON.stringify({ clientSubmissionId: submissionKey, attempts }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) return { ok: false, status: res.status, reason: data?.error }
  return { ok: true, submission: data.submission as Submission }
}

export type CompletionResult = {
  ok: boolean
  status: number
  reason?: string
  stars?: number
  accuracy?: number
  scheduledReviewItems?: number
  rewards?: { xp: number; gems: number }
}

export async function completeVerifiedLesson(
  lessonId: string,
  submissionId: string,
): Promise<CompletionResult> {
  const res = await authFetch('/api/progress/lesson', {
    method: 'POST',
    body: JSON.stringify({ lessonId, submissionId }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) return { ok: false, status: res.status, reason: data?.error }
  return {
    ok: true,
    status: res.status,
    stars: data?.stars,
    accuracy: data?.accuracy,
    scheduledReviewItems: data?.scheduledReviewItems,
    rewards: data?.rewards,
  }
}

/**
 * Which 15-step screen hosts each activity mechanic. The 15-step spine is the
 * learner-facing shape; the nine scored screens are the graded evidence. Every
 * scored screen has to appear somewhere or the submission stays incomplete.
 */
export const MECHANIC_STEP: Record<ActivityMechanic, number> = {
  tap_the_lesson_words: 4,
  multiple_choice_meaning: 6,
  dialogue_sequence_builder: 8,
  drag_to_build_model_phrase: 8,
  multiple_choice_form_control: 8,
  listen_repeat_self_check: 10,
  speaking_or_writing_transfer: 11,
  save_phrase_to_review_deck: 14,
}

/** Screens rendered at a given 15-step position, in activity order. */
export function screensForStep(activity: Activity | null, step: number): ActivityScreen[] {
  if (!activity) return []
  return activity.screens.filter((s) => {
    const target = MECHANIC_STEP[s.mechanic]
    // word_sort shares the tap mechanic with the keyword screen; the second one
    // belongs with meaning practice, not with the keyword tap.
    if (s.mechanic === 'tap_the_lesson_words' && (s.distractor_items?.length ?? 0) > 0) return step === 6
    return target === step
  })
}
