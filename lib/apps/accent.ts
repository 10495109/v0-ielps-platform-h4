import type { AccentToken } from './types'

export type AccentClasses = {
  solid: string
  soft: string
  text: string
  ring: string
  dot: string
  gradient: string
}

/** Map a brand accent token to Tailwind utility classes (all brand tokens). */
export const ACCENT: Record<AccentToken, AccentClasses> = {
  primary: {
    solid: 'bg-primary text-primary-foreground',
    soft: 'bg-primary/10 text-primary',
    text: 'text-primary',
    ring: 'ring-primary/30',
    dot: 'bg-primary',
    gradient: 'from-primary/15 to-primary/0',
  },
  secondary: {
    solid: 'bg-secondary text-secondary-foreground',
    soft: 'bg-secondary/10 text-secondary',
    text: 'text-secondary',
    ring: 'ring-secondary/30',
    dot: 'bg-secondary',
    gradient: 'from-secondary/15 to-secondary/0',
  },
  turquoise: {
    solid: 'bg-accent text-accent-foreground',
    soft: 'bg-accent/15 text-accent-foreground',
    text: 'text-accent-foreground',
    ring: 'ring-accent/40',
    dot: 'bg-accent',
    gradient: 'from-accent/20 to-accent/0',
  },
  gold: {
    solid: 'bg-gold text-indigo',
    soft: 'bg-gold/20 text-indigo',
    text: 'text-indigo',
    ring: 'ring-gold/50',
    dot: 'bg-gold',
    gradient: 'from-gold/25 to-gold/0',
  },
  indigo: {
    solid: 'bg-indigo text-primary-foreground',
    soft: 'bg-indigo/10 text-indigo',
    text: 'text-indigo',
    ring: 'ring-indigo/30',
    dot: 'bg-indigo',
    gradient: 'from-indigo/15 to-indigo/0',
  },
}
