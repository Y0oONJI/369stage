import type { Stage } from '../types/task'
import { STAGES } from '../types/task'

/** Task 카드용 미니 진행 표시 */
export function ProgressDots({ currentStage, done }: { currentStage: Stage; done: boolean }) {
  const currentIndex = done ? STAGES.length : STAGES.indexOf(currentStage)

  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {STAGES.map((s, i) => (
        <span
          key={s}
          className={[
            'h-1.5 w-6 rounded-full transition-colors',
            done || i < currentIndex
              ? 'bg-emerald-500/90'
              : i === currentIndex
                ? 'bg-indigo-400'
                : 'bg-zinc-800',
          ].join(' ')}
        />
      ))}
      {done && (
        <span className="ml-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-500/90">
          Done
        </span>
      )}
    </div>
  )
}
