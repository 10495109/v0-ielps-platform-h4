import type { EngineVocabularyCard } from './engine'

/**
 * Where the picture in a keyword pop-up comes from.
 *
 * Order matters, and there is deliberately no generic decorative fallback:
 *
 *  1. `server`  — the lesson supplied a real image for this exact word.
 *  2. `ielps`   — an IELPS vocabulary illustration drawn for this exact word.
 *  3. `brief`   — neither exists, so the pop-up shows the server's own visual
 *                 brief for the word and says plainly that no picture has been
 *                 supplied yet. A stock picture that merely decorates the card
 *                 would teach the wrong meaning, so we do not show one.
 *
 * Note on the live backend: `lesson_engine_15.js` currently emits
 * `visualDefinition` and `imageExample` as *briefs* — sentences describing the
 * picture that should be drawn — not as image locations. Until a picture per
 * vocabulary card exists, most words resolve to `brief`.
 */
export type KeywordImage =
  | { kind: 'server'; src: string; alt: string }
  | { kind: 'ielps'; src: string; alt: string }
  | { kind: 'brief'; brief: string }

/**
 * IELPS vocabulary illustrations, keyed by the exact word they depict.
 * Every entry is drawn for its own word — this is a lookup, not a decoration.
 */
export const IELPS_KEYWORD_ILLUSTRATIONS: Record<string, string> = {
  book: '/keywords/book.jpg',
  pen: '/keywords/pen.jpg',
  listen: '/keywords/listen.jpg',
  help: '/keywords/help.jpg',
  repeat: '/keywords/repeat.jpg',
}

function asImageLocation(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  // A brief is a sentence. A picture is a URL or a path.
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^\/[^\s]+\.(png|jpe?g|webp|avif|svg)$/i.test(trimmed)) return trimmed
  return null
}

export function resolveKeywordImage(card: EngineVocabularyCard): KeywordImage {
  const raw = card as unknown as Record<string, unknown>
  const fromServer =
    asImageLocation(raw.imageUrl) ||
    asImageLocation(raw.image) ||
    asImageLocation(raw.imageExample)
  if (fromServer) {
    return { kind: 'server', src: fromServer, alt: `${card.word} — picture supplied by the lesson` }
  }

  const illustration = IELPS_KEYWORD_ILLUSTRATIONS[card.word.trim().toLowerCase()]
  if (illustration) {
    return { kind: 'ielps', src: illustration, alt: `${card.word} — IELPS vocabulary illustration` }
  }

  const brief =
    (typeof raw.visualDefinition === 'string' && raw.visualDefinition.trim()) ||
    (typeof raw.imageExample === 'string' && raw.imageExample.trim()) ||
    ''
  return { kind: 'brief', brief }
}
