import type { CefrLevel, QuizItem, VocabCard } from './spec'

/**
 * Sample lesson content used as graceful fallback when the live server does not
 * return lesson/vocabulary/manifest payloads for a given step. Live data always
 * takes precedence when an endpoint responds.
 */

export type SampleLesson = {
  lessonId: string
  title: string
  level: CefrLevel
  timeEstimate: string
  topic: string
  intro: string
  outcomes: { canDo: string; speaking: string; review: string; aims: string[] }
  keywords: VocabCard[]
  meaningPractice: QuizItem[]
  grammar: { pattern: string; examples: string[]; items: QuizItem[] }
  audioModels: { id: string; text: string; seconds: number }[]
  writingPrompts: string[]
  errorFixes: { wrong: string; fixed: string; note: string }[]
  supportedPractice: string[]
  checkItems: QuizItem[]
  nextLessonId: string
}

export const SAMPLE_LESSON: SampleLesson = {
  lessonId: 'a2-daily-routines-03',
  title: 'Talking About My Daily Routine',
  level: 'A2',
  timeEstimate: '18 min',
  topic: 'Present simple · Daily life',
  intro:
    'In this lesson I learn how to describe what I do every day, using the present simple and common time expressions.',
  outcomes: {
    canDo: 'I can describe my daily routine using the present simple.',
    speaking: 'I can talk for 30 seconds about a typical day.',
    review: 'I can remember 8 routine verbs and 4 time expressions.',
    aims: [
      'Use present simple for habits and routines',
      'Add time expressions: always, usually, at 7am, in the evening',
      'Ask and answer "What time do you...?"',
    ],
  },
  keywords: [
    { word: 'wake up', ipa: '/weɪk ʌp/', definition: 'To stop sleeping and open your eyes.', example: 'I wake up at seven o’clock.' },
    { word: 'get dressed', ipa: '/ɡet drest/', definition: 'To put on your clothes.', example: 'She gets dressed after breakfast.' },
    { word: 'commute', ipa: '/kəˈmjuːt/', definition: 'To travel to work or school.', example: 'I commute by bus every morning.' },
    { word: 'errand', ipa: '/ˈerənd/', definition: 'A short trip to do a small job.', example: 'I run errands on Saturday.' },
    { word: 'usually', ipa: '/ˈjuːʒuəli/', definition: 'Most of the time; normally.', example: 'I usually have lunch at noon.' },
    { word: 'in the evening', definition: 'The time after work, before night.', example: 'We relax in the evening.' },
  ],
  meaningPractice: [
    { id: 'm1', kind: 'match', prompt: 'Match: "commute"', options: ['travel to work', 'go to sleep', 'cook dinner'], answer: 'travel to work' },
    { id: 'm2', kind: 'match', prompt: 'Match: "errand"', options: ['a small job', 'a long holiday', 'a big meal'], answer: 'a small job' },
    { id: 'm3', kind: 'match', prompt: 'Match: "usually"', options: ['most of the time', 'never', 'yesterday'], answer: 'most of the time' },
    { id: 'g1', kind: 'gap', prompt: 'Complete the sentence', sentence: 'I ___ at 7am every day.', options: ['wake up', 'woke up', 'waking'], answer: 'wake up' },
    { id: 'g2', kind: 'gap', prompt: 'Complete the sentence', sentence: 'She ___ by train to the office.', options: ['commutes', 'commute', 'commuting'], answer: 'commutes' },
    { id: 'g3', kind: 'gap', prompt: 'Complete the sentence', sentence: 'We relax ___ the evening.', options: ['in', 'on', 'at'], answer: 'in' },
    { id: 'c1', kind: 'mcq', prompt: 'Which sentence is correct?', options: ['He get up early.', 'He gets up early.', 'He getting up early.'], answer: 'He gets up early.' },
    { id: 'c2', kind: 'mcq', prompt: 'Choose the time expression.', options: ['quickly', 'usually', 'happy'], answer: 'usually' },
    { id: 'c3', kind: 'mcq', prompt: 'What do you do in the morning?', options: ['I wake up.', 'I waked up.', 'I am wake up.'], answer: 'I wake up.' },
  ],
  grammar: {
    pattern: 'Present simple: subject + base verb (add -s for he/she/it).',
    examples: ['I work from home.', 'She works in a school.', 'They commute together.'],
    items: [
      { id: 'gm1', kind: 'match', prompt: 'Match: he / she / it', options: ['adds -s', 'adds -ing', 'no change'], answer: 'adds -s' },
      { id: 'gm2', kind: 'match', prompt: 'Match: I / you / we / they', options: ['base verb', 'adds -s', 'adds -ed'], answer: 'base verb' },
      { id: 'gg1', kind: 'gap', prompt: 'Complete', sentence: 'She ___ (get) dressed at 8am.', options: ['gets', 'get', 'getting'], answer: 'gets' },
      { id: 'gg2', kind: 'gap', prompt: 'Complete', sentence: 'They ___ (commute) by bus.', options: ['commute', 'commutes', 'commuting'], answer: 'commute' },
      { id: 'gc1', kind: 'mcq', prompt: 'Choose the correct form.', options: ['He do errands.', 'He does errands.', 'He doing errands.'], answer: 'He does errands.' },
      { id: 'gc2', kind: 'mcq', prompt: 'Choose the correct form.', options: ['We usually wakes up.', 'We usually wake up.', 'We usually waking up.'], answer: 'We usually wake up.' },
    ],
  },
  audioModels: [
    { id: 'au1', text: 'I wake up at seven o’clock.', seconds: 3 },
    { id: 'au2', text: 'She gets dressed after breakfast.', seconds: 4 },
    { id: 'au3', text: 'I commute by bus every morning.', seconds: 4 },
    { id: 'au4', text: 'We usually have lunch at noon.', seconds: 4 },
    { id: 'au5', text: 'They relax in the evening.', seconds: 3 },
  ],
  writingPrompts: [
    'Write one sentence about what time you wake up.',
    'Write about how you commute.',
    'Write one thing you usually do in the morning.',
    'Write one thing you do in the evening.',
    'Write a question with "What time do you...?"',
    'Write about an errand you do each week.',
    'Write two sentences about a typical day.',
  ],
  errorFixes: [
    { wrong: 'He wake up early.', fixed: 'He wakes up early.', note: 'Add -s for he/she/it.' },
    { wrong: 'I usually commutes by train.', fixed: 'I usually commute by train.', note: 'No -s with "I".' },
    { wrong: 'She get dressed at 8.', fixed: 'She gets dressed at 8.', note: 'Add -s for she.' },
    { wrong: 'We relaxes in the evening.', fixed: 'We relax in the evening.', note: 'No -s with "we".' },
    { wrong: 'They does errands on Saturday.', fixed: 'They do errands on Saturday.', note: 'Use "do" with they.' },
  ],
  supportedPractice: [
    'Describe your morning in two sentences.',
    'Ask a partner what time they wake up.',
    'Say three things you usually do.',
    'Use "in the evening" in a sentence.',
    'Turn "He commute" into a correct sentence.',
    'Add a time expression to "I check my email".',
    'Give one full sentence about your weekend errands.',
  ],
  checkItems: [
    { id: 'ck1', kind: 'mcq', prompt: 'Choose the correct sentence.', options: ['She wake up at six.', 'She wakes up at six.', 'She waking up at six.'], answer: 'She wakes up at six.' },
    { id: 'ck2', kind: 'gap', prompt: 'Complete', sentence: 'I ___ by bus.', options: ['commute', 'commutes', 'commuting'], answer: 'commute' },
    { id: 'ck3', kind: 'match', prompt: 'Match: "usually"', options: ['most of the time', 'never'], answer: 'most of the time' },
    { id: 'ck4', kind: 'mcq', prompt: 'Pick the time expression.', options: ['slowly', 'in the evening', 'blue'], answer: 'in the evening' },
    { id: 'ck5', kind: 'gap', prompt: 'Complete', sentence: 'He ___ dressed after breakfast.', options: ['gets', 'get', 'getting'], answer: 'gets' },
    { id: 'ck6', kind: 'mcq', prompt: 'Which question is correct?', options: ['What time you wake up?', 'What time do you wake up?', 'What time waking you up?'], answer: 'What time do you wake up?' },
    { id: 'ck7', kind: 'match', prompt: 'Match: "errand"', options: ['a small job', 'a big party'], answer: 'a small job' },
  ],
  nextLessonId: 'a2-daily-routines-04',
}
