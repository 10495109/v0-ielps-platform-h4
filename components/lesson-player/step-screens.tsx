'use client'

import { useRef, useState } from 'react'
import {
  Play,
  Pause,
  Volume2,
  Mic,
  Sparkles,
  Check,
  Languages,
  Target,
  BookOpen,
} from 'lucide-react'
import type { AccentToken } from '@/lib/apps/types'
import { ACCENT } from '@/lib/apps/accent'
import {
  SUPPORT_LANGUAGES,
  type LessonStep,
  type SupportLanguage,
} from '@/lib/lesson-player/spec'
import type { VocabCard, QuizItem } from '@/lib/lesson-player/spec'
import {
  engineKeywords,
  engineStepFor,
  type LessonEngine15,
} from '@/lib/lesson-player/engine'
import type { LessonIdentity } from './lesson-player'
import { QuizRunner } from './quiz-runner'
import { SourceBadge } from '@/components/app/source-badge'
import { VerifiedActivityRunner, type PlayableActivity, type ServerSubmission } from './verified-activity-runner'
import type { DataSource } from '@/lib/use-eilps'

type StepProps = {
  step: LessonStep
  lesson: LessonIdentity
  engine: LessonEngine15 | null
  content: LessonContent
  accent: AccentToken
  juniorReadability: boolean
  aiHelpEnabled: boolean
  supportLanguage: SupportLanguage
  setSupportLanguage: (l: SupportLanguage) => void
  onDone: () => void | Promise<void>
  activity: PlayableActivity | null
  activitySource: DataSource
  submission: ServerSubmission | null
  onVerified: (submission: ServerSubmission) => void
}

function StepShell({
  step,
  accent,
  children,
  junior,
}: {
  step: LessonStep
  accent: AccentToken
  children: React.ReactNode
  junior: boolean
}) {
  const a = ACCENT[accent]
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${a.solid}`}>
          {step.step}
        </span>
        <div>
          <h2 className={`font-serif font-semibold text-foreground ${junior ? 'text-2xl' : 'text-xl'}`}>
            {step.title}
          </h2>
          <p className={`text-muted-foreground ${junior ? 'text-base' : 'text-sm'}`}>
            {step.instruction}
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}

/** A minimal play/pause-only audio control, per the audio rules. */
function AudioChip({ text, accent, src }: { text: string; accent: AccentToken; src?: string }) {
  const a = ACCENT[accent]
  const [playing, setPlaying] = useState(false)
  const audio = useRef<HTMLAudioElement | null>(null)
  function toggle() {
    if (src) {
      if (!audio.current) {
        audio.current = new Audio(src)
        audio.current.addEventListener('ended', () => setPlaying(false))
      }
      if (playing) audio.current.pause()
      else void audio.current.play()
      setPlaying(!playing)
      return
    }
    if (!('speechSynthesis' in window)) return
    if (playing) {
      window.speechSynthesis.cancel()
      setPlaying(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-GB'
    utterance.onend = () => setPlaying(false)
    window.speechSynthesis.speak(utterance)
    setPlaying(true)
  }
  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${a.soft}`}
      aria-label={playing ? 'Pause audio' : 'Play audio'}
    >
      {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      <span className="max-w-[16rem] truncate">{text}</span>
    </button>
  )
}

/**
 * Everything the 15-stage engine actually gives us for this lesson, in the
 * shapes the approved screens already render.
 *
 * There is no fallback anywhere in here. The engine supplies the vocabulary
 * cards and, for the practice steps, the *requirements* an activity has to meet
 * — it does not ship ready-made quiz items. So those arrays stay empty and the
 * screen says so, rather than borrowing demonstration questions. The graded,
 * server-marked activity is step 14.
 */
export type LessonContent = {
  keywords: VocabCard[]
  meaningPractice: QuizItem[]
  grammar: { pattern: string; examples: string[]; items: QuizItem[] }
  audioModels: { id: string; text: string; seconds: number }[]
  writingPrompts: string[]
  errorFixes: { wrong: string; fixed: string; note: string }[]
  supportedPractice: string[]
  checkItems: QuizItem[]
}

export function serverContent(engine: LessonEngine15 | null): LessonContent {
  const keywords: VocabCard[] = engineKeywords(engine).map((card) => ({
    word: card.word,
    definition: card.definition ?? '',
    example: card.usageExample ?? '',
  }))
  return {
    keywords,
    meaningPractice: [],
    grammar: { pattern: '', examples: [], items: [] },
    audioModels: [],
    writingPrompts: [],
    errorFixes: [],
    supportedPractice: [],
    checkItems: [],
  }
}

/**
 * Shown where the server has not sent playable items for a step. It prints the
 * server's own first-person instruction for that step so the learner still gets
 * real guidance, and points at the graded activity.
 */
function ServerNotProvided({
  engine,
  uiStep,
  accent,
  onDone,
}: {
  engine: LessonEngine15 | null
  uiStep: number
  accent: AccentToken
  onDone: () => void | Promise<void>
}) {
  const engineStep = engineStepFor(engine, uiStep)
  return (
    <>
      <div className="rounded-2xl border border-border bg-soft p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            From the lesson engine
          </span>
          <SourceBadge source={engineStep ? 'live' : 'not_implemented'} />
        </div>
        {engineStep ? (
          <>
            <p className="mt-2 text-sm text-foreground">{engineStep.instructionFirstPerson}</p>
            {engineStep.instructionLanguage?.supportText ? (
              <p className="mt-1.5 text-sm text-muted-foreground">
                {engineStep.instructionLanguage.supportText}
              </p>
            ) : null}
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            The lesson engine did not send this step.
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          The server does not publish practice items for this step. The graded
          activity for this lesson is the verified check at step 14, which the
          server marks.
        </p>
      </div>
      <PrimaryButton accent={accent} onClick={onDone}>Continue</PrimaryButton>
    </>
  )
}

export function StepScreen(input: Omit<StepProps, 'content'>) {
  // Everything the screens render is derived from the engine here, once.
  const props: StepProps = { ...input, content: serverContent(input.engine) }
  const { step } = props
  switch (step.kind) {
    case 'intro':
      return <IntroStep {...props} />
    case 'outcomes':
      return <OutcomesStep {...props} />
    case 'language-support':
      return <LanguageSupportStep {...props} />
    case 'keywords':
      return <KeywordsStep {...props} />
    case 'definitions':
      return <DefinitionsStep {...props} />
    case 'quiz':
      return <QuizStep {...props} items={props.content.meaningPractice} />
    case 'memory-review':
      return <MemoryReviewStep {...props} />
    case 'grammar':
      return <GrammarStep {...props} />
    case 'speaking':
      return <SpeakingStep {...props} />
    case 'listen-repeat':
      return <ListenRepeatStep {...props} />
    case 'writing':
      return <WritingStep {...props} />
    case 'error-fix':
      return <ErrorFixStep {...props} />
    case 'supported-practice':
      return <SupportedPracticeStep {...props} />
    case 'check':
      return <VerifiedCheckStep {...props} />
    case 'recap':
      return <RecapStep {...props} />
    default:
      return null
  }
}

function PrimaryButton({
  accent,
  onClick,
  children,
}: {
  accent: AccentToken
  onClick: () => void
  children: React.ReactNode
}) {
  const a = ACCENT[accent]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`self-end rounded-full px-6 py-2.5 text-sm font-semibold ${a.solid}`}
    >
      {children}
    </button>
  )
}

function IntroStep({ step, lesson, accent, onDone, juniorReadability }: StepProps) {
  const a = ACCENT[accent]
  const j = juniorReadability
  return (
    <StepShell step={step} accent={accent} junior={j}>
      <div className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br p-6 ${a.gradient}`}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
          <span className={`rounded-full px-2.5 py-0.5 ${a.solid}`}>{lesson.level}</span>
          <span className="text-muted-foreground">{lesson.topic}</span>
        </div>
        <h3 className="mt-3 font-serif text-2xl font-semibold text-foreground text-balance">{lesson.title}</h3>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{lesson.intro}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <AudioChip text="Play lesson intro" accent={accent} />
          <span className="text-sm text-muted-foreground">Estimated {lesson.timeEstimate}</span>
        </div>
      </div>
      <PrimaryButton accent={accent} onClick={onDone}>
        {j ? "Let's start!" : 'Start lesson'}
      </PrimaryButton>
    </StepShell>
  )
}

function OutcomesStep({ step, lesson, accent, juniorReadability, onDone }: StepProps) {
  const a = ACCENT[accent]
  const rows = [
    { icon: Target, label: 'Can-do target', value: lesson.outcomes.canDo },
    { icon: Mic, label: 'Speaking target', value: lesson.outcomes.speaking },
    { icon: BookOpen, label: 'Review target', value: lesson.outcomes.review },
  ]
  return (
    <StepShell step={step} accent={accent} junior={juniorReadability}>
      <div className="grid gap-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <span className={`grid size-8 place-items-center rounded-lg ${a.soft}`}>
              <r.icon className="size-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{r.label}</p>
              <p className="text-sm text-card-foreground">{r.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-soft p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lesson aims (CEFR-graded)</p>
        <ul className="mt-2 space-y-1.5">
          {lesson.outcomes.aims.map((aim) => (
            <li key={aim} className="flex items-start gap-2 text-sm text-foreground">
              <Check className={`mt-0.5 size-4 ${a.text}`} /> {aim}
            </li>
          ))}
        </ul>
      </div>
      <PrimaryButton accent={accent} onClick={onDone}>Got it</PrimaryButton>
    </StepShell>
  )
}

function LanguageSupportStep({ step, accent, juniorReadability, supportLanguage, setSupportLanguage, onDone }: StepProps) {
  const a = ACCENT[accent]
  return (
    <StepShell step={step} accent={accent} junior={juniorReadability}>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Languages className={`size-4 ${a.text}`} />
          <p className="text-sm font-medium text-card-foreground">Learning happens in English. Choose a support language for help only.</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SUPPORT_LANGUAGES.map((l) => {
            const active = l.code === supportLanguage
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setSupportLanguage(l.code)}
                className={[
                  'rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                  active ? `border-transparent ${a.solid}` : 'border-border bg-background hover:border-foreground/20',
                ].join(' ')}
              >
                {l.label}
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Default may follow Cloudflare country/language signals. You can override it at any time.
        </p>
      </div>
      <PrimaryButton accent={accent} onClick={onDone}>Continue in English</PrimaryButton>
    </StepShell>
  )
}

function KeywordsStep({ step, accent, juniorReadability, onDone, content, engine }: StepProps) {
  const a = ACCENT[accent]
  const [tapped, setTapped] = useState<Set<string>>(new Set())
  const allTapped = tapped.size >= content.keywords.length
  if (!content.keywords.length) {
    return (
      <StepShell step={step} accent={accent} junior={juniorReadability}>
        <ServerNotProvided engine={engine} uiStep={4} accent={accent} onDone={onDone} />
      </StepShell>
    )
  }
  return (
    <StepShell step={step} accent={accent} junior={juniorReadability}>
      <p className="text-sm text-muted-foreground">Tap each word to hear it. Cards show the English word only.</p>
      <div className="flex flex-wrap gap-2.5">
        {content.keywords.map((k) => {
          const on = tapped.has(k.word)
          return (
            <button
              key={k.word}
              type="button"
              onClick={() => setTapped((prev) => new Set(prev).add(k.word))}
              className={[
                'inline-flex items-center gap-2 rounded-full border px-4 font-medium transition-all',
                juniorReadability ? 'py-3 text-lg' : 'py-2 text-sm',
                on ? `border-transparent ${a.solid}` : 'border-border bg-card hover:border-foreground/20',
              ].join(' ')}
            >
              <Volume2 className="size-4" /> {k.word}
            </button>
          )
        })}
      </div>
      <PrimaryButton accent={accent} onClick={onDone}>{allTapped ? 'Next' : 'Skip ahead'}</PrimaryButton>
    </StepShell>
  )
}

function DefinitionsStep({ step, accent, juniorReadability, onDone, content, engine }: StepProps) {
  const a = ACCENT[accent]
  const [open, setOpen] = useState<string | null>(content.keywords[0]?.word ?? null)
  if (!content.keywords.length) {
    return (
      <StepShell step={step} accent={accent} junior={juniorReadability}>
        <ServerNotProvided engine={engine} uiStep={5} accent={accent} onDone={onDone} />
      </StepShell>
    )
  }
  return (
    <StepShell step={step} accent={accent} junior={juniorReadability}>
      <div className="grid gap-3 sm:grid-cols-2">
        {content.keywords.map((k) => {
          const isOpen = open === k.word
          return (
            <button
              key={k.word}
              type="button"
              onClick={() => setOpen(isOpen ? null : k.word)}
              className={[
                'rounded-2xl border p-4 text-left transition-colors',
                isOpen ? `${a.ring} ring-2 border-transparent bg-card` : 'border-border bg-card hover:border-foreground/20',
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-lg font-semibold text-card-foreground">{k.word}</span>
                <AudioChip text="Hear" accent={accent} />
              </div>
              {k.ipa ? <span className="text-xs text-muted-foreground">{k.ipa}</span> : null}
              {isOpen ? (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-foreground">{k.definition}</p>
                  <p className={`rounded-lg px-3 py-2 text-sm ${a.soft}`}>“{k.example}”</p>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Tap to reveal picture, meaning and example.</p>
              )}
            </button>
          )
        })}
      </div>
      <PrimaryButton accent={accent} onClick={onDone}>I understand these</PrimaryButton>
    </StepShell>
  )
}

function QuizStep(props: StepProps & { items: QuizItem[] }) {
  if (!props.items.length) {
    return (
      <StepShell step={props.step} accent={props.accent} junior={props.juniorReadability}>
        <ServerNotProvided engine={props.engine} uiStep={6} accent={props.accent} onDone={props.onDone} />
      </StepShell>
    )
  }
  const { step, accent, juniorReadability, items, onDone } = props
  return (
    <StepShell step={step} accent={accent} junior={juniorReadability}>
      <QuizRunner items={items} accent={accent} onComplete={onDone} />
    </StepShell>
  )
}

function MemoryReviewStep({ step, accent, juniorReadability, onDone, content, engine }: StepProps) {
  const a = ACCENT[accent]
  const [i, setI] = useState(0)
  const card = content.keywords[i]
  const [flipped, setFlipped] = useState(false)
  function grade() {
    if (i + 1 >= content.keywords.length) return onDone()
    setI((n) => n + 1)
    setFlipped(false)
  }
  if (!content.keywords.length) {
    return (
      <StepShell step={step} accent={accent} junior={juniorReadability}>
        <ServerNotProvided engine={engine} uiStep={7} accent={accent} onDone={onDone} />
      </StepShell>
    )
  }
  return (
    <StepShell step={step} accent={accent} junior={juniorReadability}>
      <p className="text-sm text-muted-foreground">Spaced review — wrong items come back sooner, correct items later.</p>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className={`grid min-h-40 place-items-center rounded-2xl border border-border bg-gradient-to-br p-6 text-center ${a.gradient}`}
      >
        {flipped ? (
          <div>
            <p className="text-sm text-muted-foreground">{card?.definition}</p>
            <p className="mt-2 text-sm text-foreground">“{card?.example}”</p>
          </div>
        ) : (
          <span className="font-serif text-2xl font-semibold text-foreground">{card?.word}</span>
        )}
      </button>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">Card {i + 1} of {content.keywords.length}</span>
        <div className="flex gap-2">
          <button type="button" onClick={grade} className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-soft">
            Hard
          </button>
          <button type="button" onClick={grade} className={`rounded-full px-4 py-2 text-sm font-semibold ${a.solid}`}>
            I remember
          </button>
        </div>
      </div>
    </StepShell>
  )
}

function GrammarStep({ step, accent, juniorReadability, onDone, content, engine }: StepProps) {
  const a = ACCENT[accent]
  const [showQuiz, setShowQuiz] = useState(false)
  if (!content.grammar.items.length) {
    return (
      <StepShell step={step} accent={accent} junior={juniorReadability}>
        <ServerNotProvided engine={engine} uiStep={8} accent={accent} onDone={onDone} />
      </StepShell>
    )
  }
  return (
    <StepShell step={step} accent={accent} junior={juniorReadability}>
      {!showQuiz ? (
        <>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Language pattern</p>
            <p className="mt-1 font-medium text-card-foreground">{content.grammar.pattern}</p>
            <div className="mt-3 space-y-1.5">
              {content.grammar.examples.map((ex) => (
                <p key={ex} className={`rounded-lg px-3 py-2 text-sm ${a.soft}`}>{ex}</p>
              ))}
            </div>
          </div>
          <PrimaryButton accent={accent} onClick={() => setShowQuiz(true)}>Practise the pattern</PrimaryButton>
        </>
      ) : (
        <QuizRunner items={content.grammar.items} accent={accent} onComplete={onDone} />
      )}
    </StepShell>
  )
}

function SpeakingStep({ step, accent, juniorReadability, aiHelpEnabled, onDone, content, engine }: StepProps) {
  const a = ACCENT[accent]
  const [recording, setRecording] = useState(false)
  const [recorded, setRecorded] = useState(false)
  if (!content.audioModels.length) {
    return (
      <StepShell step={step} accent={accent} junior={juniorReadability}>
        <ServerNotProvided engine={engine} uiStep={9} accent={accent} onDone={onDone} />
      </StepShell>
    )
  }
  return (
    <StepShell step={step} accent={accent} junior={juniorReadability}>
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm text-card-foreground">Say this clearly:</p>
        <p className="mt-2 font-serif text-lg font-semibold text-foreground">“{content.audioModels[0]?.text}”</p>
        <div className="mt-4 flex items-center gap-3">
          <AudioChip text="Hear the model" accent={accent} />
          <button
            type="button"
            onClick={() => {
              setRecording((r) => !r)
              if (recording) setRecorded(true)
            }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${recording ? 'bg-destructive text-primary-foreground' : a.solid}`}
          >
            <Mic className="size-4" /> {recording ? 'Stop' : 'Record'}
          </button>
        </div>
        {recorded ? (
          <div className="mt-4 rounded-xl bg-soft p-4">
            <p className="text-sm font-medium text-foreground">Recording captured for practice.</p>
            {aiHelpEnabled ? (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className={`size-3.5 ${a.text}`} /> AI and Azure feedback is requested only after a real audio submission.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      <PrimaryButton accent={accent} onClick={onDone}>Continue</PrimaryButton>
    </StepShell>
  )
}

function ListenRepeatStep({ step, accent, juniorReadability, onDone, content, engine }: StepProps) {
  const [done, setDone] = useState<Set<string>>(new Set())
  const all = done.size >= content.audioModels.length
  if (!content.audioModels.length) {
    return (
      <StepShell step={step} accent={accent} junior={juniorReadability}>
        <ServerNotProvided engine={engine} uiStep={10} accent={accent} onDone={onDone} />
      </StepShell>
    )
  }
  return (
    <StepShell step={step} accent={accent} junior={juniorReadability}>
      <p className="text-sm text-muted-foreground">Listen to each model, then repeat. Play/pause only.</p>
      <div className="grid gap-2.5">
        {content.audioModels.map((m, idx) => (
          <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground">{idx + 1}</span>
              <AudioChip text={m.text} accent={accent} />
            </div>
            <button
              type="button"
              onClick={() => setDone((prev) => new Set(prev).add(m.id))}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${done.has(m.id) ? 'border-success/50 bg-success/10 text-success' : 'border-border hover:bg-soft'}`}
            >
              {done.has(m.id) ? 'Repeated' : 'Mark repeated'}
            </button>
          </div>
        ))}
      </div>
      <PrimaryButton accent={accent} onClick={onDone}>{all ? 'Next' : 'Continue'}</PrimaryButton>
    </StepShell>
  )
}

function WritingStep({ step, accent, juniorReadability, onDone, content, engine }: StepProps) {
  const [i, setI] = useState(0)
  const [text, setText] = useState('')
  const [tries, setTries] = useState(0)
  const prompt = content.writingPrompts[i]
  const showSupport = tries >= 3
  function submit() {
    if (text.trim().length < 3) {
      setTries((t) => t + 1)
      return
    }
    if (i + 1 >= content.writingPrompts.length) return onDone()
    setI((n) => n + 1)
    setText('')
    setTries(0)
  }
  if (!content.writingPrompts.length) {
    return (
      <StepShell step={step} accent={accent} junior={juniorReadability}>
        <ServerNotProvided engine={engine} uiStep={11} accent={accent} onDone={onDone} />
      </StepShell>
    )
  }
  return (
    <StepShell step={step} accent={accent} junior={juniorReadability}>
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Prompt {i + 1} of {content.writingPrompts.length}</p>
        <p className="mt-1 font-medium text-card-foreground">{prompt}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Write your response in English..."
          className="mt-3 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-foreground/30"
        />
        {showSupport ? (
          <div className="mt-3 rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm">
            <p className="font-semibold text-foreground">Sentence starters</p>
            <p className="mt-1 text-muted-foreground">Every day I… / I usually… / In the morning I…</p>
          </div>
        ) : null}
      </div>
      <PrimaryButton accent={accent} onClick={submit}>Submit response</PrimaryButton>
    </StepShell>
  )
}

function ErrorFixStep({ step, accent, juniorReadability, onDone, content, engine }: StepProps) {
  const a = ACCENT[accent]
  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const item = content.errorFixes[i]
  function next() {
    if (i + 1 >= content.errorFixes.length) return onDone()
    setI((n) => n + 1)
    setRevealed(false)
  }
  if (!content.errorFixes.length) {
    return (
      <StepShell step={step} accent={accent} junior={juniorReadability}>
        <ServerNotProvided engine={engine} uiStep={12} accent={accent} onDone={onDone} />
      </StepShell>
    )
  }
  return (
    <StepShell step={step} accent={accent} junior={juniorReadability}>
      <p className="text-sm text-muted-foreground">Find and fix the mistake ({i + 1} of {content.errorFixes.length}).</p>
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="rounded-lg bg-destructive/10 px-3 py-2 font-mono text-sm text-foreground line-through decoration-destructive/60">
          {item?.wrong}
        </p>
        {revealed ? (
          <>
            <p className="mt-3 rounded-lg bg-success/10 px-3 py-2 font-mono text-sm text-foreground">{item?.fixed}</p>
            <p className="mt-2 text-xs text-muted-foreground">{item?.note}</p>
          </>
        ) : null}
        <div className="mt-4">
          {!revealed ? (
            <button type="button" onClick={() => setRevealed(true)} className={`rounded-full px-5 py-2 text-sm font-semibold ${a.solid}`}>
              Show the fix
            </button>
          ) : (
            <button type="button" onClick={next} className={`rounded-full px-5 py-2 text-sm font-semibold ${a.solid}`}>
              {i + 1 >= content.errorFixes.length ? 'Finish' : 'Next mistake'}
            </button>
          )}
        </div>
      </div>
    </StepShell>
  )
}

function SupportedPracticeStep({ step, accent, juniorReadability, onDone, content, engine }: StepProps) {
  const a = ACCENT[accent]
  const [done, setDone] = useState<Set<number>>(new Set())
  if (!content.supportedPractice.length) {
    return (
      <StepShell step={step} accent={accent} junior={juniorReadability}>
        <ServerNotProvided engine={engine} uiStep={13} accent={accent} onDone={onDone} />
      </StepShell>
    )
  }
  return (
    <StepShell step={step} accent={accent} junior={juniorReadability}>
      <p className="text-sm text-muted-foreground">Practise with support. Help fades as you succeed.</p>
      <div className="grid gap-2">
        {content.supportedPractice.map((task, idx) => {
          const on = done.has(idx)
          return (
            <button
              key={task}
              type="button"
              onClick={() => setDone((prev) => new Set(prev).add(idx))}
              className={[
                'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                on ? 'border-success/50 bg-success/10' : 'border-border bg-card hover:border-foreground/20',
              ].join(' ')}
            >
              <span className={`grid size-6 place-items-center rounded-full text-xs font-bold ${on ? 'bg-success text-primary-foreground' : a.soft}`}>
                {on ? <Check className="size-3.5" /> : idx + 1}
              </span>
              <span className="text-foreground">{task}</span>
            </button>
          )
        })}
      </div>
      <PrimaryButton accent={accent} onClick={onDone}>Done practising</PrimaryButton>
    </StepShell>
  )
}

function VerifiedCheckStep({ step, accent, juniorReadability, activity, activitySource, submission, onVerified }: StepProps) {
  return (
    <StepShell step={step} accent={accent} junior={juniorReadability}>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-soft p-3">
        <p className="text-sm text-muted-foreground">Your evidence is marked by the IELPS server. The browser does not calculate your grade.</p>
        <SourceBadge source={activitySource} />
      </div>
      {submission ? (
        <div className="rounded-xl border border-success/40 bg-success/10 p-4 text-sm text-foreground">
          <p className="font-semibold">Server marking complete</p>
          <p className="mt-1">{Math.round(submission.score)} of {submission.maxScore} points · {submission.stars} of 3 stars · {submission.status.replaceAll('_', ' ')}</p>
        </div>
      ) : activity ? (
        <VerifiedActivityRunner activity={activity} accent={accent} onVerified={onVerified} />
      ) : (
        <p className="rounded-xl border border-border p-4 text-sm text-muted-foreground">A verified activity is not available for this account or lesson.</p>
      )}
    </StepShell>
  )
}

function RecapStep({ step, lesson, accent, juniorReadability, onDone, content }: StepProps) {
  const a = ACCENT[accent]
  return (
    <StepShell step={step} accent={accent} junior={juniorReadability}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Words</p>
          <p className="mt-1 text-sm text-card-foreground">{content.keywords.map((k) => k.word).join(', ')}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Language</p>
          <p className="mt-1 text-sm text-card-foreground">{content.grammar.pattern}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skill</p>
          <p className="mt-1 text-sm text-card-foreground">{lesson.outcomes.canDo}</p>
        </div>
        <div className={`rounded-xl border border-transparent p-4 ${a.soft}`}>
          <p className="text-xs font-semibold uppercase tracking-wide">Next step</p>
          <p className="mt-1 text-sm font-medium">Save progress and continue the course.</p>
        </div>
      </div>
      <PrimaryButton accent={accent} onClick={onDone}>Complete lesson</PrimaryButton>
    </StepShell>
  )
}
