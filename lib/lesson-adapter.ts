'use client'

/**
 * Frontend adapter: lesson id -> live curriculum content.
 *
 * The live server has no `/api/lessons/:id` route; the authoritative lesson
 * content lives in `GET /api/curriculum/deep-catalog`
 * (levels[] -> units[] -> lessons[]). This adapter fetches that catalogue once,
 * finds the requested lesson, and normalises it into the shape the 15-step
 * player already renders. No backend change, no duplicate route.
 *
 * Sample content is used ONLY when the live request itself fails.
 */

import { authFetch } from '@/lib/eilps-auth'
import { SAMPLE_LESSON, type SampleLesson } from '@/lib/lesson-player/content'
import type { CefrLevel, QuizItem, VocabCard } from '@/lib/lesson-player/spec'

export const DEEP_CATALOG_PATH = '/api/curriculum/deep-catalog'

type RawExercise = {
  id?: string
  type?: string
  prompt?: string
  options?: unknown
  answer?: unknown
  sentence?: string
  hint?: string
  audio?: string
  passage?: string
  target?: string
  tip?: string
  rubric?: string
}

type RawLesson = Record<string, unknown> & {
  id?: string
  title?: string
  level?: string
  unitTitle?: string
  unitFocus?: string
  lessonAim?: string
  cefrCanDo?: string
  objectives?: unknown
  canDo?: unknown
  vocabularySet?: unknown
  grammarFocus?: unknown
  pronunciationPractice?: unknown
  exercises?: unknown
  reviewItems?: unknown
  speakingTask?: unknown
  writingTask?: unknown
  media?: unknown
}

export type LiveCatalog = {
  levels?: {
    level?: string
    title?: string
    units?: { id?: string; title?: string; focus?: string; lessons?: RawLesson[] }[]
  }[]
}

const LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function asLevel(v: unknown): CefrLevel {
  return LEVELS.includes(v as CefrLevel) ? (v as CefrLevel) : 'A1'
}

function strings(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

/** Server answers are option indexes; the player compares answer text. */
function answerText(ex: RawExercise): string {
  const options = strings(ex.options)
  if (typeof ex.answer === 'number' && options[ex.answer] !== undefined) {
    return options[ex.answer]
  }
  if (typeof ex.answer === 'string') return ex.answer
  return options[0] ?? ''
}

function toQuizItem(ex: RawExercise, fallbackId: string): QuizItem | null {
  const options = strings(ex.options)
  if (options.length < 2) return null
  const prompt = typeof ex.prompt === 'string' ? ex.prompt : 'Choose the best answer.'
  const kind: QuizItem['kind'] =
    ex.type === 'blank' ? 'gap' : ex.type === 'choice' ? 'mcq' : 'match'
  const item: QuizItem = {
    id: typeof ex.id === 'string' ? ex.id : fallbackId,
    kind,
    prompt,
    options,
    answer: answerText(ex),
  }
  if (kind === 'gap' && typeof ex.sentence === 'string') item.sentence = ex.sentence
  return item
}

/** Vocabulary comes back as a word list; give each card usable copy. */
function toVocabCards(lesson: RawLesson): VocabCard[] {
  const words = strings(lesson.vocabularySet)
  if (!words.length) return SAMPLE_LESSON.keywords
  const topic =
    typeof lesson.unitTitle === 'string' ? lesson.unitTitle.toLowerCase() : 'this lesson'
  const models = strings(
    (lesson.reviewItems as { back?: string }[] | undefined)?.map?.((r) => r?.back) ?? [],
  )
  return words.slice(0, 12).map((word, i) => ({
    word,
    definition: `Key word for ${topic}.`,
    example: models[i % Math.max(models.length, 1)] || `Use "${word}" when you talk about ${topic}.`,
  }))
}

function audioLines(lesson: RawLesson): { id: string; text: string; seconds: number }[] {
  const media = lesson.media as { audioScript?: string } | undefined
  const script = typeof media?.audioScript === 'string' ? media.audioScript : ''
  const lines = script
    .split('\n')
    .map((l) => l.replace(/^[^:]{0,40}:\s*/, '').trim())
    .filter(Boolean)
  if (!lines.length) return SAMPLE_LESSON.audioModels
  return lines.slice(0, 6).map((text, i) => ({
    id: `au${i + 1}`,
    text,
    seconds: Math.max(2, Math.round(text.split(' ').length / 2.2)),
  }))
}

/** Map one live catalogue lesson onto the player's content shape. */
export function normalizeLesson(lesson: RawLesson, nextId = ''): SampleLesson {
  const exercises = Array.isArray(lesson.exercises) ? (lesson.exercises as RawExercise[]) : []
  const quiz = exercises
    .map((ex, i) => toQuizItem(ex, `${lesson.id ?? 'ex'}-${i}`))
    .filter((q): q is QuizItem => q !== null)

  const meaningPractice = quiz.filter((q) => q.kind !== 'gap')
  const grammarItems = quiz.filter((q) => q.kind === 'gap')
  const speaking = lesson.speakingTask as { prompt?: string; target?: string } | undefined
  const writing = lesson.writingTask as { prompt?: string } | undefined
  const objectives = strings(lesson.objectives)
  const canDo = strings(lesson.canDo)

  return {
    lessonId: typeof lesson.id === 'string' ? lesson.id : SAMPLE_LESSON.lessonId,
    title: typeof lesson.title === 'string' ? lesson.title : SAMPLE_LESSON.title,
    level: asLevel(lesson.level),
    timeEstimate: '18 min',
    topic:
      typeof lesson.unitFocus === 'string' && lesson.unitFocus
        ? lesson.unitFocus
        : typeof lesson.unitTitle === 'string'
          ? lesson.unitTitle
          : SAMPLE_LESSON.topic,
    intro:
      typeof lesson.lessonAim === 'string' && lesson.lessonAim
        ? lesson.lessonAim
        : SAMPLE_LESSON.intro,
    outcomes: {
      canDo:
        (typeof lesson.cefrCanDo === 'string' && lesson.cefrCanDo) ||
        canDo[0] ||
        SAMPLE_LESSON.outcomes.canDo,
      speaking: speaking?.prompt || canDo[1] || SAMPLE_LESSON.outcomes.speaking,
      review: writing?.prompt || SAMPLE_LESSON.outcomes.review,
      aims: objectives.length ? objectives.slice(0, 4) : SAMPLE_LESSON.outcomes.aims,
    },
    keywords: toVocabCards(lesson),
    meaningPractice: meaningPractice.length ? meaningPractice : SAMPLE_LESSON.meaningPractice,
    grammar: {
      pattern:
        typeof lesson.grammarFocus === 'string' && lesson.grammarFocus
          ? lesson.grammarFocus
          : SAMPLE_LESSON.grammar.pattern,
      examples: (() => {
        const ex = strings((lesson.reviewItems as { back?: string }[] | undefined)?.map?.((r) => r?.back) ?? [])
        return ex.length ? ex.slice(0, 3) : SAMPLE_LESSON.grammar.examples
      })(),
      items: grammarItems.length ? grammarItems : SAMPLE_LESSON.grammar.items,
    },
    audioModels: audioLines(lesson),
    writingPrompts: writing?.prompt ? [writing.prompt] : SAMPLE_LESSON.writingPrompts,
    errorFixes: SAMPLE_LESSON.errorFixes,
    supportedPractice: strings(lesson.pronunciationPractice).length
      ? strings(lesson.pronunciationPractice)
      : SAMPLE_LESSON.supportedPractice,
    checkItems: quiz.length ? quiz.slice(0, 6) : SAMPLE_LESSON.checkItems,
    nextLessonId: nextId || SAMPLE_LESSON.nextLessonId,
  }
}

/** Flatten levels -> units -> lessons, preserving the authoritative order. */
export function flattenLessons(catalog: LiveCatalog): RawLesson[] {
  const out: RawLesson[] = []
  for (const level of catalog.levels ?? []) {
    for (const unit of level.units ?? []) {
      for (const lesson of unit.lessons ?? []) {
        out.push({ ...lesson, level: lesson.level ?? level.level })
      }
    }
  }
  return out
}

let catalogPromise: Promise<LiveCatalog> | null = null

/** The catalogue is large and static per session, so fetch it once. */
export function fetchDeepCatalog(): Promise<LiveCatalog> {
  if (!catalogPromise) {
    catalogPromise = (async () => {
      const res = await authFetch(DEEP_CATALOG_PATH)
      if (!res.ok) {
        catalogPromise = null
        throw new Error(`deep-catalog ${res.status}`)
      }
      return (await res.json()) as LiveCatalog
    })()
  }
  return catalogPromise
}

export type LiveLessonResult = { lesson: SampleLesson; lessonId: string; total: number }

/**
 * Resolve `/learner?lesson=:id` against the live catalogue.
 * With no id, the first lesson of the course spine is used.
 * Throws when the live request fails — the caller decides about fallback.
 */
export async function fetchLessonById(lessonId?: string | null): Promise<LiveLessonResult> {
  const catalog = await fetchDeepCatalog()
  const lessons = flattenLessons(catalog)
  if (!lessons.length) throw new Error('deep-catalog returned no lessons')

  const index = lessonId ? lessons.findIndex((l) => l.id === lessonId) : 0
  const resolved = index >= 0 ? index : 0
  const next = lessons[resolved + 1]

  return {
    lesson: normalizeLesson(lessons[resolved], typeof next?.id === 'string' ? next.id : ''),
    lessonId: String(lessons[resolved].id ?? ''),
    total: lessons.length,
  }
}

/** Read the lesson id the platform passes as `?lesson=`. */
export function lessonIdFromLocation(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('lesson')
}
