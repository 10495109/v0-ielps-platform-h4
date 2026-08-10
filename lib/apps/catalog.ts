/**
 * The deep catalogue is nested levels -> units -> lessons, not a flat list, so
 * the usual "find the array in the response" helper returns nothing for it and
 * the panel silently falls back to sample content. Flatten it explicitly.
 */
export function catalogLessons(raw: unknown): Record<string, unknown>[] {
  const root = raw as { levels?: unknown[] } | null
  if (!root || !Array.isArray(root.levels)) return []

  const lessons: Record<string, unknown>[] = []
  for (const level of root.levels as Record<string, unknown>[]) {
    for (const unit of (level.units as Record<string, unknown>[]) ?? []) {
      for (const lesson of (unit.lessons as Record<string, unknown>[]) ?? []) {
        // Level and unit only exist on the parents, but every consumer wants them.
        lessons.push({
          ...lesson,
          level: lesson.level ?? level.level,
          unitTitle: lesson.unitTitle ?? unit.title,
        })
      }
    }
  }
  return lessons
}

/** A short learner-facing description, whichever field the lesson carries. */
export function lessonBlurb(lesson: Record<string, unknown>, fallback = ''): string {
  return String(lesson.lessonAim ?? lesson.cefrCanDo ?? lesson.canDo ?? lesson.summary ?? fallback)
}
