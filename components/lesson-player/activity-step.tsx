'use client'

import { ACCENT } from '@/lib/apps/accent'
import type { LessonEngine } from './use-lesson-engine'
import { ActivityScreenView } from './activity-screens'

/**
 * Renders the server-scored activity screens that belong to the current
 * 15-step position. When a step owns scored screens these replace the
 * illustrative content, because this is the evidence the server actually
 * grades — the rest of the spine stays as the surrounding lesson experience.
 */
export function ActivityStep({ e, junior = false }: { e: LessonEngine; junior?: boolean }) {
  const a = ACCENT[e.accent]
  const screens = e.activityScreens

  return (
    <div className={`flex flex-col gap-5 ${junior ? 'text-[1.0625rem] leading-relaxed' : ''}`}>
      <div>
        <h2 className={`font-display font-semibold text-foreground ${junior ? 'text-2xl' : 'text-xl'}`}>
          {e.activeStep.title}
        </h2>
        <p className={`mt-1 text-muted-foreground ${junior ? 'text-base' : 'text-sm'}`}>
          {e.activeStep.instruction}
        </p>
      </div>

      {screens.map((screen) => (
        <ActivityScreenView
          key={screen.screen_id}
          screen={screen}
          accent={e.accent}
          evidence={e.evidence[screen.screen_id] ?? {}}
          onChange={(evidence) => e.setEvidence(screen.screen_id, evidence)}
          onSavePhrase={(phrase) => e.savePhrase(screen.screen_id, phrase)}
          savingPhrase={e.savingPhrase}
        />
      ))}

      <button
        type="button"
        onClick={e.completeStep}
        className={`self-end rounded-full px-6 py-2.5 text-sm font-semibold ${a.solid}`}
      >
        Continue
      </button>
    </div>
  )
}
