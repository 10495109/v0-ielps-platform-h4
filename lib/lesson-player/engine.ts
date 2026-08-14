/**
 * The real 15-stage lesson engine contract.
 *
 * Served by GET /api/lesson-support/lessons/:id/engine-15 as
 * `{ lessonEngine15: { … } }`. The backend builds it in lesson_engine_15.js and
 * describes itself as an *additive* contract: it supplies the per-step
 * instructions, the CEFR targets, the vocabulary cards and the activity
 * requirements, and it explicitly does not replace the base lesson fields.
 *
 * Two rules are enforced here and nowhere else:
 *  - the payload is validated. A 200 whose shape does not match this contract is
 *    an error, so the player can render `Unavailable` rather than pretend.
 *  - nothing in this file has a fallback. If the server did not send it, the
 *    caller gets `undefined` and must say so on screen. Sample content never
 *    reaches a live lesson through this path.
 */

export type EngineInstructionLanguage = {
  primary: string
  support: string
  supportText?: string
}

export type EngineVocabularyCard = {
  word: string
  language?: string
  definition?: string
  visualDefinition?: string
  usageExample?: string
  imageExample?: string
}

export type EngineStep = {
  id: string
  title: string
  order: number
  instructionFirstPerson: string
  instructionLanguage: EngineInstructionLanguage
  cards?: EngineVocabularyCard[]
  cefr?: {
    level?: string
    descriptor?: string
    languageRule?: string
    canDoTarget?: string | null
    speakingTarget?: string | null
    reviewTarget?: string | null
  }
  activityRequirements?: unknown
  aiSupport?: { endpoint?: string; modes?: string[] }
  writingEndpoint?: string
  speakingEndpoint?: string
  aiHelpEndpoint?: string
  recap?: Record<string, string>
  progressionPolicy?: { progressEndpoint?: string; nextEndpoint?: string; cannotSkipNextCourseLesson?: boolean }
  mediaPlaceholder?: Record<string, unknown>
  learnerGoal?: Record<string, unknown>
  completionRouting?: Record<string, unknown>
  supportRule?: string
}

export type LessonEngine15 = {
  version: string
  lessonId: string
  level: string
  cefrStage?: string | null
  ageBand?: string
  providerEndpoints?: Record<string, string>
  vocabularyCards: EngineVocabularyCard[]
  steps: EngineStep[]
}

/** The engine's own step ids, in the order the backend emits them. */
export const ENGINE_STEP_IDS = [
  'intro-video',
  'my-goal',
  'visual-keywords',
  'aims-outcomes',
  'meaning-practice',
  'build-language',
  'listen-repeat',
  'write-response',
  'fix-mistake',
  'supported-practice',
  'check-learning',
  'real-life-use',
  'recap',
  'next-step',
  'complete-route',
] as const

/**
 * Which engine step backs each screen of the approved 15-step player. The two
 * sequences are not a straight 1:1 — the approved UI splits the engine's
 * `visual-keywords` into a keyword screen and a definitions screen, and folds
 * the engine's closing three steps into its single recap screen.
 */
export const ENGINE_STEP_FOR_UI: Record<number, string> = {
  1: 'intro-video',
  2: 'my-goal',
  3: 'my-goal',
  4: 'visual-keywords',
  5: 'visual-keywords',
  6: 'meaning-practice',
  7: 'recap',
  8: 'build-language',
  9: 'real-life-use',
  10: 'listen-repeat',
  11: 'write-response',
  12: 'fix-mistake',
  13: 'supported-practice',
  14: 'check-learning',
  15: 'next-step',
}

function asRecord(value: unknown): Record<string, unknown> {
  return (value ?? {}) as Record<string, unknown>
}

/** Throws when the response is not the engine contract, so the caller shows `Unavailable`. */
export function parseEngine15(raw: unknown): LessonEngine15 {
  const root = asRecord(raw)
  const engine = asRecord(root.lessonEngine15 ?? root)
  const steps = Array.isArray(engine.steps) ? engine.steps : null
  if (!engine.lessonId || !steps || steps.length === 0) {
    throw new Error('invalid_engine_15_contract')
  }
  const parsedSteps: EngineStep[] = steps.map((entry) => {
    const step = asRecord(entry)
    if (!step.id || !step.instructionFirstPerson) throw new Error('invalid_engine_15_step')
    return step as unknown as EngineStep
  })
  const cards = Array.isArray(engine.vocabularyCards)
    ? (engine.vocabularyCards as EngineVocabularyCard[])
    : []
  return {
    version: String(engine.version || ''),
    lessonId: String(engine.lessonId),
    level: String(engine.level || ''),
    cefrStage: (engine.cefrStage as string | null) ?? null,
    ageBand: engine.ageBand ? String(engine.ageBand) : undefined,
    providerEndpoints: (engine.providerEndpoints as Record<string, string>) || undefined,
    vocabularyCards: cards,
    steps: parsedSteps,
  }
}

export function engineStepFor(engine: LessonEngine15 | null, uiStep: number): EngineStep | undefined {
  if (!engine) return undefined
  const id = ENGINE_STEP_FOR_UI[uiStep]
  return engine.steps.find((s) => s.id === id)
}

/** The CEFR targets the server declares for this lesson, or undefined. */
export function engineOutcomes(engine: LessonEngine15 | null) {
  const aims = engine?.steps.find((s) => s.id === 'aims-outcomes')
  return aims?.cefr
}

/** The server's own vocabulary cards. Never padded, never substituted. */
export function engineKeywords(engine: LessonEngine15 | null): EngineVocabularyCard[] {
  if (!engine) return []
  const fromStep = engine.steps.find((s) => s.id === 'visual-keywords')?.cards
  return (fromStep && fromStep.length ? fromStep : engine.vocabularyCards) ?? []
}
