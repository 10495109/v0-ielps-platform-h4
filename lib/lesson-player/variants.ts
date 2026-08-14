/**
 * Per-account framing for the shared 15-step lesson player. The 15-step spine is
 * identical across account types (per the spec); these variants adapt copy,
 * readability and the role's relationship to the lesson (learn / preview / QA).
 */

export type PlayerMode = 'learn' | 'preview' | 'qa' | 'author'

export type PlayerVariant = {
  /** Which app slug this variant belongs to. */
  slug: string
  mode: PlayerMode
  /** Larger type + simpler language for young learners. */
  juniorReadability: boolean
  /** Banner shown above the player explaining the role's context. */
  contextBanner: string
  /** Label for the entry CTA on the dashboard / nav. */
  entryLabel: string
  /** Who the "learner" is, for the top bar. */
  learnerLabel: string
  /** Whether AI help affordances are surfaced (school/parent policy). */
  aiHelpEnabled: boolean
}

export const PLAYER_VARIANTS: Record<string, PlayerVariant> = {
  adult: {
    slug: 'adult',
    mode: 'learn',
    juniorReadability: false,
    contextBanner:
      'Your self-paced adult lesson — the authoritative 15-step spine, from placement-aligned outcomes through to a graded completion.',
    entryLabel: 'Continue my lesson',
    learnerLabel: 'You',
    aiHelpEnabled: true,
  },
  junior: {
    slug: 'junior',
    mode: 'learn',
    juniorReadability: true,
    contextBanner: 'Safe junior lesson player — big buttons, tap-to-reveal words, and audio you can play or pause.',
    entryLabel: 'Continue lesson',
    learnerLabel: 'Alex (You)',
    aiHelpEnabled: false,
  },
  parents: {
    slug: 'parents',
    mode: 'preview',
    juniorReadability: false,
    contextBanner: 'Preview mode — this is exactly what your child sees. Walk the 15 steps to understand their lesson before they start.',
    entryLabel: 'Preview child lesson',
    learnerLabel: 'Preview: your child',
    aiHelpEnabled: true,
  },
  teachers: {
    slug: 'teachers',
    mode: 'preview',
    juniorReadability: false,
    contextBanner: 'Assignment preview — review the exact 15-step lesson before assigning it to a class.',
    entryLabel: 'Preview assigned lesson',
    learnerLabel: 'Preview: assigned lesson',
    aiHelpEnabled: true,
  },
  schools: {
    slug: 'schools',
    mode: 'qa',
    juniorReadability: false,
    contextBanner: 'Quality-assurance mode — verify CEFR alignment and step completeness for organisation-wide rollout.',
    entryLabel: 'QA a lesson',
    learnerLabel: 'QA: sample learner',
    aiHelpEnabled: true,
  },
  tutors: {
    slug: 'tutors',
    mode: 'preview',
    juniorReadability: false,
    contextBanner: 'Session prep — the course lesson your booked learner is working through, so you can support the same spine.',
    entryLabel: 'Open session lesson',
    learnerLabel: 'Session learner',
    aiHelpEnabled: true,
  },
  studio: {
    slug: 'studio',
    mode: 'author',
    juniorReadability: false,
    contextBanner: 'Authoring preview — see your published content rendered through the live 15-step player exactly as learners experience it.',
    entryLabel: 'Preview published lesson',
    learnerLabel: 'Preview: authored lesson',
    aiHelpEnabled: true,
  },
}

export function getVariant(slug: string): PlayerVariant {
  return PLAYER_VARIANTS[slug] ?? PLAYER_VARIANTS.junior
}
