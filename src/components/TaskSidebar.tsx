import { useTaskStore } from '../store/taskStore'
import type { Task } from '../types/task'
import { ProgressDots } from './ProgressDots'

type Props = {
  selectedId: string | null
  onSelect: (id: string) => void
  onNewTask: () => void
}

export function TaskSidebar({ selectedId, onSelect, onNewTask }: Props) {
  const tasks = useTaskStore((s) => s.tasks)

  const active = tasks.filter((t) => t.status === 'active')
  const completed = tasks.filter((t) => t.status === 'done')

  return (
    <aside className="flex w-full max-w-sm flex-col border-r border-zinc-800/80 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
        <h1 className="text-sm font-semibold tracking-tight text-zinc-100">369stage</h1>
        <button
          type="button"
          onClick={onNewTask}
          className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-900 hover:bg-white"
        >
          새 작업
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {tasks.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-zinc-500">
            작업이 없습니다. 새 작업을 추가하세요.
          </p>
        ) : (
          <>
            {active.length > 0 && (
              <Section label="진행 중">
                {active.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    selected={t.id === selectedId}
                    onSelect={() => onSelect(t.id)}
                  />
                ))}
              </Section>
            )}
            {completed.length > 0 && (
              <Section label="완료">
                {completed.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    selected={t.id === selectedId}
                    onSelect={() => onSelect(t.id)}
                  />
                ))}
              </Section>
            )}
          </>
        )}
      </div>
    </aside>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </div>
  )
}

function TaskRow({
  task,
  selected,
  onSelect,
}: {
  task: Task
  selected: boolean
  onSelect: () => void
}) {
  const done = task.status === 'done'

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={[
          'flex w-full flex-col gap-2 rounded-md px-2 py-2 text-left transition-colors',
          selected ? 'bg-zinc-800/90' : 'hover:bg-zinc-900',
        ].join(' ')}
      >
        <span
          className={[
            'truncate text-sm font-medium leading-tight',
            done ? 'text-zinc-400' : 'text-zinc-100',
          ].join(' ')}
        >
          {task.title}
        </span>
        <ProgressDots currentStage={task.currentStage} done={done} />
      </button>
    </li>
  )
}
