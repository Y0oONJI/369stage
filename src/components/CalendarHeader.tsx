type Props = {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onNewTask: () => void
  onToggleView: () => void
}

export function CalendarHeader({
  year,
  month,
  onPrev,
  onNext,
  onToday,
  onNewTask,
  onToggleView,
}: Props) {
  const label = new Date(year, month, 1).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800/80 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{label}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="이전 달"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={onToday}
            className="rounded-md px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={onNext}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="다음 달"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleView}
          className="rounded-md px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          리스트 뷰
        </button>
        <button
          type="button"
          onClick={onNewTask}
          className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          새 작업
        </button>
      </div>
    </div>
  )
}
