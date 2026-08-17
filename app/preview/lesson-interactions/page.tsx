'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { ReadingActivity } from '@/components/lesson-player/reading-activity'
import { WritingActivity } from '@/components/lesson-player/writing-activity'
import { KeywordChip, KeywordPopup } from '@/components/lesson-player/keyword-popup'
import type { ActivityScreen } from '@/components/lesson-player/verified-activity-runner'
import type { EngineVocabularyCard } from '@/lib/lesson-player/engine'

/**
 * DESIGN PREVIEW ONLY — for visual approval of the reading window, the writing
 * window and the keyword pop-up.
 *
 * This route exists so the three interactions can be seen and approved before
 * the entitled lesson write-path is open. The content below is sample text,
 * labelled as such on screen, and it never reaches a learner: the real screens
 * take their content from the lesson engine and show nothing when the server
 * has sent nothing. Delete this folder once the visuals are signed off.
 */

const READING_SCREEN: ActivityScreen = {
  screen_id: 'preview-reading',
  mechanic: 'multiple_choice_meaning',
  instruction: 'Read the whole conversation, then answer the questions beside it.',
  options: [
    { id: 'a', text: 'She is asking for directions to the station.' },
    { id: 'b', text: 'She is buying a ticket for the next train.' },
    { id: 'c', text: 'She is complaining about a delay.' },
  ],
}

const READING_PASSAGE = {
  title: 'Reading: at the ticket office',
  lines: [
    { speaker: 'Amara', text: 'Good morning. Could you tell me when the next train to Manchester leaves?' },
    { speaker: 'Clerk', text: 'It leaves at ten past nine, from platform four. That is in about twelve minutes.' },
    { speaker: 'Amara', text: 'Thank you. And how much is a single ticket?' },
    { speaker: 'Clerk', text: 'A single is twenty-eight pounds. A return is thirty-nine, and it is valid for a month.' },
    { speaker: 'Amara', text: 'I will take the return, please. Do I need to book a seat?' },
    { speaker: 'Clerk', text: 'You do not have to, but I would if I were you — the nine o’clock service is usually busy on a Friday.' },
    { speaker: 'Amara', text: 'Then yes, please. A window seat, if there is one left.' },
    { speaker: 'Clerk', text: 'There is. Coach C, seat forty-two. Here is your ticket — platform four, and mind the step as you board.' },
  ],
}

const WRITING_SCREEN: ActivityScreen = {
  screen_id: 'preview-writing',
  mechanic: 'speaking_or_writing_transfer',
  prompt:
    'Write a short message to a friend explaining how to get from the station to your home. Say which platform they arrive at, how long the walk is, and what they will see on the way.',
  required_words: ['platform', 'about', 'turn', 'past', 'arrive'],
  model_line:
    'You arrive at platform four. Come out of the main entrance and turn left. It is about ten minutes on foot, past the library.',
  self_check: [
    'Have you said which platform they arrive at?',
    'Have you given the walking time?',
    'Have you used at least three of the lesson words?',
  ],
  anti_gaming: { min_unique_words: 25, must_use_required_words: 3 },
}

const KEYWORDS: EngineVocabularyCard[] = [
  {
    word: 'book',
    definition: 'To arrange something in advance so it is kept for you, such as a seat or a ticket.',
    usageExample: 'I booked a window seat on the nine o’clock train.',
  },
  {
    word: 'listen',
    definition: 'To pay attention to a sound so that you understand it.',
    usageExample: 'Listen to the announcement — it tells you the platform.',
  },
  {
    word: 'repeat',
    definition: 'To say or do something again.',
    usageExample: 'Could you repeat the departure time, please?',
  },
  {
    word: 'help',
    definition: 'To do something that makes things easier for another person.',
    usageExample: 'The clerk helped me find the right platform.',
  },
  {
    word: 'pen',
    definition: 'A thin object you hold in your hand and write with, using ink.',
    usageExample: 'She wrote the seat number down with a pen.',
  },
  {
    word: 'platform',
    definition: 'The raised area beside a railway line where you get on and off a train.',
    // No picture exists for this word — the honest state is shown instead.
    visualDefinition:
      'Show a railway platform clearly, with a numbered sign and a train alongside, so the place is identifiable without reading extra text.',
  } as EngineVocabularyCard,
]

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-10 first:border-t-0">
      <h2 className="font-display text-2xl font-black tracking-tight text-foreground">{title}</h2>
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">{note}</p>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export default function Page() {
  const [answer, setAnswer] = useState<Record<string, unknown>>({})
  const [writing, setWriting] = useState('')
  const [openWord, setOpenWord] = useState<string | null>(null)
  const [seen, setSeen] = useState<Set<string>>(new Set())
  const open = KEYWORDS.find((card) => card.word === openWord) || null

  const questions = (
    <div className="grid gap-2">
      <p className="mb-1 text-sm text-muted-foreground">What is Amara doing?</p>
      {(READING_SCREEN.options || []).map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setAnswer({ selectedOptionId: option.id })}
          className={`rounded-xl border p-3 text-left text-sm ${
            answer.selectedOptionId === option.id
              ? 'bg-primary text-primary-foreground'
              : 'border-border bg-card'
          }`}
        >
          {option.text}
        </button>
      ))}
    </div>
  )

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-gold/50 bg-gold/15">
        <div className="mx-auto flex max-w-6xl items-start gap-3 px-5 py-3.5 lg:px-8">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-indigo" />
          <p className="text-sm font-semibold text-indigo">
            Design preview. The text on this page is sample content for approval only — the real
            screens take every word from the lesson engine and show nothing where the server has
            sent nothing.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-16 lg:px-8">
        <Section
          title="Reading activity — expansion window"
          note="The passage is previewed in the lesson card and opens into a window with the questions beside it, so the learner can read and answer without leaving the text."
        >
          <ReadingActivity
            passage={READING_PASSAGE}
            accent="primary"
            instruction={READING_SCREEN.instruction}
          >
            {questions}
          </ReadingActivity>
        </Section>

        <Section
          title="Writing activity — expansion window"
          note="The task, the lesson language it has to use and the model line sit beside a writing area with room to think. Submission still goes through the existing activity contract."
        >
          <WritingActivity
            screen={WRITING_SCREEN}
            accent="secondary"
            value={writing}
            onChange={setWriting}
          />
        </Section>

        <Section
          title="Keywords — clickable vocabulary pop-up"
          note="Every keyword opens its own small window: the picture for that word, the word, its meaning, an example, and pronunciation. The last word has no picture on the platform, so the pop-up says so rather than showing a decorative one."
        >
          <div className="flex flex-wrap gap-2.5">
            {KEYWORDS.map((card) => (
              <KeywordChip
                key={card.word}
                card={card}
                accent="turquoise"
                large={false}
                active={seen.has(card.word)}
                onOpen={() => {
                  setSeen((prev) => new Set(prev).add(card.word))
                  setOpenWord(card.word)
                }}
              />
            ))}
          </div>
          {open ? (
            <KeywordPopup card={open} accent="turquoise" onClose={() => setOpenWord(null)} />
          ) : null}
        </Section>
      </div>
    </main>
  )
}
