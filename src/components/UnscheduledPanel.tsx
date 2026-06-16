type CalendarTask = { id: string; title: string; startDate: string; dueDate: string }

type Props = {
  tasks: CalendarTask[]
  onSelectTask: (id: string) => void
}

export function UnscheduledPanel({ tasks, onSelectTask }: Props) {
  if (tasks.length === 0) return null

  return (
    <div className="flex w-52 shrink-0 flex-col border-l border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          미배정 ({tasks.length})
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {tasks.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelectTask(t.id)}
            className="w-full rounded-md px-2 py-1.5 text-left hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <p className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
              {t.title}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
