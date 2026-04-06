import type { Stage } from '../types/task'
import { STAGES, STAGE_LABELS } from '../types/task'

type Props = {
  currentStage: Stage
  viewStage: Stage
  onSelectStage: (stage: Stage) => void
  disabled?: boolean
}

export function StageStepper({
  currentStage,
  viewStage,
  onSelectStage,
  disabled,
}: Props) {
  const currentIndex = STAGES.indexOf(currentStage)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        단계
      </p>
      <div className="flex gap-2">
        {STAGES.map((stage, index) => {
          const isPast = index < currentIndex
          const isCurrent = stage === currentStage
          const isView = stage === viewStage
          const label = STAGE_LABELS[stage]

          return (
            <button
              key={stage}
              type="button"
              disabled={disabled}
              onClick={() => onSelectStage(stage)}
              className={[
                'flex min-w-0 flex-1 flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors',
                isView
                  ? 'border-indigo-300 bg-indigo-50 shadow-sm'
                  : 'border-zinc-200 bg-white hover:border-zinc-300',
                disabled && 'opacity-60',
              ].join(' ')}
            >
              <span
                className={[
                  'text-xs font-medium tabular-nums',
                  isPast || isCurrent ? 'text-zinc-900' : 'text-zinc-500',
                ].join(' ')}
              >
                {stage}%
              </span>
              <span
                className={[
                  'truncate text-[11px] leading-tight',
                  isCurrent ? 'text-zinc-800' : 'text-zinc-500',
                ].join(' ')}
                title={label}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
