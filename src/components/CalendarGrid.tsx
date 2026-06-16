type CalendarTask = { id: string; title: string; startDate: string; dueDate: string }

type Props = {
  year: number
  month: number
  tasks: CalendarTask[]
  onSelectTask: (id: string) => void
}

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']

function toYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildCells(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = (firstDay.getDay() + 6) % 7

  const cells: { date: Date; current: boolean }[] = []

  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month, -i), current: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), current: true })
  }
  const trailing = (7 - (cells.length % 7)) % 7
  for (let i = 1; i <= trailing; i++) {
    cells.push({ date: new Date(year, month + 1, i), current: false })
  }

  return cells
}

export function CalendarGrid({ year, month, tasks, onSelectTask }: Props) {
  const today = toYMD(new Date())
  const cells = buildCells(year, month)
  const weeks: { date: Date; current: boolean }[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  function getTasksForDate(ymd: string) {
    return tasks.filter((t) => {
      const start = t.startDate || t.dueDate
      const end = t.dueDate || t.startDate
      if (!start || !end) return false
      return start <= ymd && ymd <= end
    })
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800/80">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {d}
          </div>
        ))}
      </div>
      <div className="flex flex-col">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800/60">
            {week.map(({ date, current }) => {
              const ymd = toYMD(date)
              const isToday = ymd === today
              const dayTasks = getTasksForDate(ymd)
              return (
                <div
                  key={ymd}
                  className={[
                    'min-h-[100px] border-r border-zinc-200 p-1.5 dark:border-zinc-800/60',
                    !current ? 'bg-zinc-50 dark:bg-zinc-900/40' : 'bg-white dark:bg-zinc-950',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                      isToday
                        ? 'bg-zinc-900 font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : current
                          ? 'text-zinc-800 dark:text-zinc-200'
                          : 'text-zinc-400 dark:text-zinc-600',
                    ].join(' ')}
                  >
                    {date.getDate()}
                  </span>
                  <div className="mt-1 flex flex-col gap-0.5">
                    {dayTasks.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onSelectTask(t.id)}
                        className="w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
