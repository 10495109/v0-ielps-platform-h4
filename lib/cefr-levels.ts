import {
  Sprout,
  Footprints,
  Compass,
  Rocket,
  Award,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react'

export type Band = 'Basic' | 'Independent' | 'Proficient'

export type CefrLevel = {
  code: string
  name: string
  band: Band
  icon: LucideIcon
  /** Tailwind token name from the Pearson palette */
  accent: 'turquoise' | 'blue' | 'purple' | 'indigo' | 'yellow'
  onAccentDark?: boolean
  summary: string
  canDo: string
}

export const CEFR_LEVELS: CefrLevel[] = [
  {
    code: 'A1',
    name: 'Beginner',
    band: 'Basic',
    icon: Sprout,
    accent: 'turquoise',
    summary: 'Breakthrough',
    canDo:
      'Understand and use everyday expressions, introduce yourself and ask simple questions about personal details.',
  },
  {
    code: 'A2',
    name: 'Elementary',
    band: 'Basic',
    icon: Footprints,
    accent: 'blue',
    summary: 'Waystage',
    canDo:
      'Handle short social exchanges and describe your background, immediate environment and routine tasks.',
  },
  {
    code: 'B1',
    name: 'Intermediate',
    band: 'Independent',
    icon: Compass,
    accent: 'purple',
    summary: 'Threshold',
    canDo:
      'Deal with most travel situations, describe experiences and give brief reasons for opinions and plans.',
  },
  {
    code: 'B2',
    name: 'Upper Intermediate',
    band: 'Independent',
    icon: Rocket,
    accent: 'indigo',
    summary: 'Vantage',
    canDo:
      'Interact with fluency and spontaneity, and produce clear, detailed text on a wide range of subjects.',
  },
  {
    code: 'C1',
    name: 'Advanced',
    band: 'Proficient',
    icon: Award,
    accent: 'yellow',
    onAccentDark: true,
    summary: 'Effective proficiency',
    canDo:
      'Express ideas fluently for social, academic and professional purposes, using language flexibly.',
  },
  {
    code: 'C2',
    name: 'Proficiency',
    band: 'Proficient',
    icon: GraduationCap,
    accent: 'indigo',
    summary: 'Mastery',
    canDo:
      'Understand virtually everything with ease and express yourself precisely in complex situations.',
  },
]

/** URL slug for a level, e.g. "b1". */
export function levelSlug(level: CefrLevel): string {
  return level.code.toLowerCase()
}

/** Find a level by its slug ("a1"–"c2"), or undefined. */
export function getLevelBySlug(slug: string): CefrLevel | undefined {
  return CEFR_LEVELS.find((l) => l.code.toLowerCase() === slug.toLowerCase())
}
