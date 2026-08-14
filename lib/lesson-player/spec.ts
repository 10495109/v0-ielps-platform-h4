/**
 * 15-Step Lesson Player specification.
 *
 * Source of truth transcribed from the IELPS Adult Learner 15-Step Lesson
 * Player UI wiring package (lesson-player-15-step-spec.md,
 * lesson-player-state-rules.json, backend-contract-map.json, handoff-map.json).
 *
 * The same 15-step spine is applied to every account type; per-role framing and
 * readability live in ./variants.ts.
 */

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type SupportLanguage = 'en' | 'es' | 'ar' | 'zh' | 'fr' | 'pt'

export const SUPPORT_LANGUAGES: { code: SupportLanguage; label: string }[] = [
  { code: 'en', label: 'English only' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية' },
  { code: 'zh', label: '中文' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
]

export type LessonStepNumber =
  | 1 | 2 | 3 | 4 | 5
  | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15

export type Endpoint = { method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; path: string }

/** The interactive body kind each step renders. */
export type StepKind =
  | 'intro'
  | 'outcomes'
  | 'language-support'
  | 'keywords'
  | 'definitions'
  | 'quiz' // matching / gap-fill / multiple choice
  | 'memory-review'
  | 'grammar'
  | 'speaking'
  | 'listen-repeat'
  | 'writing'
  | 'error-fix'
  | 'supported-practice'
  | 'check'
  | 'recap'

export type QuizItem = {
  id: string
  kind: 'match' | 'gap' | 'mcq'
  prompt: string
  options?: string[]
  answer: string
  /** For gap-fill, text with a ___ placeholder. */
  sentence?: string
}

export type VocabCard = {
  word: string
  ipa?: string
  definition: string
  example: string
  image?: string
}

export type LessonStep = {
  step: LessonStepNumber
  kind: StepKind
  title: string
  instruction: string // first-person "I can ..."
  endpoints: Endpoint[]
  required: boolean
  allowsAiHelp?: boolean
  allowsAudio?: boolean
  stateRule: string
  /** Minimum activity counts from lesson-player-state-rules.json. */
  minItems?: number
}

/** From lesson-player-state-rules.json. */
export const STATE_RULES = {
  totalSteps: 15,
  requiredSteps: [1, 2, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15] as LessonStepNumber[],
  supportStep: 3 as LessonStepNumber,
  memoryReviewStep: 7 as LessonStepNumber,
  attempts: {
    meaningPractice: { match: 3, gap: 3, mcq: 3 },
    buildLanguage: { match: 2, gap: 2, mcq: 2 },
    listenRepeat: { models: 5 },
    writeResponse: { prompts: 7, supportAfter: 3, supportTypes: ['gap_fill', 'mix_match', 'sentence_starters'] },
    fixMistake: { activities: 5 },
    practiceWithSupport: { activities: 7 },
    checkLearning: { activities: 7, aiHelp: true },
  },
  audio: { controls: ['play', 'pause'] as const, source: 'lesson audio manifest' },
  language: {
    primary: 'en' as SupportLanguage,
    support: ['es', 'ar', 'zh', 'fr', 'pt'] as SupportLanguage[],
    defaultSignal: 'Cloudflare country/language when available',
    overrideAllowed: true,
  },
} as const

/** From handoff-map.json. */
export type Handoff = {
  label: string
  route: string
  type: 'required_next_lesson' | 'optional_enrichment' | 'skill_support' | 'evidence'
  rule: string
}

export const PRIMARY_HANDOFF: Handoff = {
  label: 'Continue to next lesson',
  route: '/learner',
  type: 'required_next_lesson',
  rule: 'Only the platform-assigned next lesson is available.',
}

export const SECONDARY_HANDOFFS: Handoff[] = [
  { label: 'Practise in StarPath', route: '/starpath', type: 'optional_enrichment', rule: 'Available after completion or as in-lesson support.' },
  { label: 'Explore Discover', route: '/discover', type: 'optional_enrichment', rule: 'Available after completion, tagged to learner CEFR level.' },
  { label: 'Open Speaking Coach', route: '/speaking', type: 'skill_support', rule: 'Available after the speaking step or completion.' },
  { label: 'View Progress', route: '/progress', type: 'evidence', rule: 'Shows mastery, evidence, review queue and skills.' },
  { label: 'View Certificate', route: '/certificates', type: 'evidence', rule: 'Visible only when certificate eligibility is met.' },
]

/** The 15 steps with their backend contracts and state rules. */
export const LESSON_STEPS: LessonStep[] = [
  {
    step: 1, kind: 'intro', title: 'Intro',
    instruction: 'I am starting today’s lesson.',
    endpoints: [
      { method: 'GET', path: '/api/curriculum/deep-catalog' },
      { method: 'GET', path: '/api/lesson-support/lessons/:id/engine-15' },
    ],
    required: true, allowsAudio: true,
    stateRule: 'Opens or continues the lesson session.',
  },
  {
    step: 2, kind: 'outcomes', title: 'My Goal',
    instruction: 'I can understand my goal for this lesson.',
    endpoints: [{ method: 'GET', path: '/api/lesson-support/lessons/:id/engine-15' }],
    required: true,
    stateRule: 'Outcomes must be CEFR-graded.',
  },
  {
    step: 3, kind: 'language-support', title: 'Instruction Language',
    instruction: 'I can choose support language while learning in English.',
    endpoints: [{ method: 'GET', path: '/api/lesson-support/language-context' }],
    required: false,
    stateRule: 'Default may come from Cloudflare country/language signals; learner override allowed.',
  },
  {
    step: 4, kind: 'keywords', title: 'Keywords',
    instruction: 'I can tap today’s lesson words.',
    endpoints: [{ method: 'GET', path: '/api/lesson-support/lessons/:id/engine-15' }],
    required: true, allowsAudio: true,
    stateRule: 'Card face shows the English word only.',
  },
  {
    step: 5, kind: 'definitions', title: 'Visual Definitions',
    instruction: 'I can understand each word with a picture, meaning, and example.',
    endpoints: [
      { method: 'GET', path: '/api/lesson-support/lessons/:id/engine-15' },
      { method: 'GET', path: '/api/lesson-support/lessons/:id/image-briefs' },
    ],
    required: true, allowsAudio: true,
    stateRule: 'Definition must be CEFR-level specific.',
  },
  {
    step: 6, kind: 'quiz', title: 'Meaning Practice',
    instruction: 'I can understand the meaning in context.',
    endpoints: [{ method: 'POST', path: '/api/activities/:lessonId/submissions' }],
    required: true, minItems: 9,
    stateRule: '3 matching, 3 gap-fill, 3 multiple choice. Errors enter support/review.',
  },
  {
    step: 7, kind: 'memory-review', title: 'Memory Review',
    instruction: 'I can remember important words.',
    endpoints: [
      { method: 'GET', path: '/api/review/due' },
      { method: 'POST', path: '/api/review/attempts' },
    ],
    required: false,
    stateRule: 'Wrong items are rescheduled; correct items increase interval.',
  },
  {
    step: 8, kind: 'grammar', title: 'Build the Language',
    instruction: 'I can build the lesson language.',
    endpoints: [
      { method: 'GET', path: '/api/lesson-support/lessons/:id/engine-15' },
      { method: 'POST', path: '/api/activities/:lessonId/submissions' },
    ],
    required: true, minItems: 6,
    stateRule: 'Unlocks after meaning practice. 2 each matching/gap-fill/MCQ.',
  },
  {
    step: 9, kind: 'speaking', title: 'Speaking Coach',
    instruction: 'I can say the language clearly.',
    endpoints: [
      { method: 'POST', path: '/api/tutor/chat/stream' },
      { method: 'POST', path: '/api/assessment/pronunciation' },
    ],
    required: true, allowsAiHelp: true, allowsAudio: true,
    stateRule: 'Mic input, AI coach, pronunciation score, chunking help.',
  },
  {
    step: 10, kind: 'listen-repeat', title: 'Listen and Repeat',
    instruction: 'I can listen and repeat with the model.',
    endpoints: [
      { method: 'GET', path: '/api/resources/starfall-splashlearn/audio-scripts/:lessonId' },
      { method: 'POST', path: '/api/assessment/pronunciation' },
    ],
    required: true, allowsAudio: true, minItems: 5,
    stateRule: '5 model audio activities, play/pause only. Audio mapped by lesson and step.',
  },
  {
    step: 11, kind: 'writing', title: 'Write My Response',
    instruction: 'I can write my own response.',
    endpoints: [{ method: 'POST', path: '/api/assessment/grade-writing' }],
    required: true, minItems: 7,
    stateRule: 'After 3 wrong tries, show gap-fill, sentence starters, or matching.',
  },
  {
    step: 12, kind: 'error-fix', title: 'Fix My Mistake',
    instruction: 'I can find and fix my mistake.',
    endpoints: [
      { method: 'GET', path: '/api/pedagogy/feedback-banks' },
      { method: 'POST', path: '/api/tutor/chat' },
    ],
    required: true, allowsAiHelp: true, minItems: 5,
    stateRule: 'Feedback bank returns CEFR-safe support.',
  },
  {
    step: 13, kind: 'supported-practice', title: 'Practice With Support',
    instruction: 'I can practise with support.',
    endpoints: [{ method: 'POST', path: '/api/activities/:lessonId/submissions' }],
    required: true, minItems: 7,
    stateRule: 'Support fades after success.',
  },
  {
    step: 14, kind: 'check', title: 'Check My Learning',
    instruction: 'I can check what I have learnt.',
    endpoints: [
      { method: 'POST', path: '/api/activities/:lessonId/submissions' },
      { method: 'POST', path: '/api/tutor/chat' },
    ],
    required: true, allowsAiHelp: true, minItems: 7,
    stateRule: 'Required before completion.',
  },
  {
    step: 15, kind: 'recap', title: 'Recap and Complete',
    instruction: 'I can recap my words, language, skill, and next step.',
    endpoints: [
      { method: 'POST', path: '/api/progress/lesson' },
      { method: 'GET', path: '/api/engine/next' },
    ],
    required: true,
    stateRule: 'Saves progress, rewards, mastery and review queue.',
  },
]

export function isRequired(step: LessonStepNumber): boolean {
  return STATE_RULES.requiredSteps.includes(step)
}
