import { useShallow } from 'zustand/react/shallow'
import { getCategoryTitle } from '../data/qaStructured'
import { formatDueDateLabel } from '../lib/formatDueDate'
import { useTaskStore } from '../store/taskStore'
import { ProgressDots } from './ProgressDots'
import { ThemeToggle } from './ThemeToggle'

type Props = {
  selectedId: string | null
  onSelect: (id: string) => void
  onNewTask: () => void
}

export function TaskSidebar({ selectedId, onSelect, onNewTask }: Props) {
  /** 제목 등 내용이 바뀌어도 id·status만 같으면 사이드바 전체 리렌더 생략 */
  const activeIds = useTaskStore(
    useShallow((s) => s.tasks.filter((t) => t.status === 'active').map((t) => t.id)),
  )
  const completedIds = useTaskStore(
    useShallow((s) => s.tasks.filter((t) => t.status === 'done').map((t) => t.id)),
  )
  const totalCount = activeIds.length + completedIds.length

  return (
    <aside className="flex w-full max-w-sm flex-col border-r border-zinc-200 bg-white dark:border-zinc-800/80 dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800/80">
        <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">369stage</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={onNewTask}
            className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            새 작업
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {totalCount === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-zinc-500">
            작업이 없습니다. 새 작업을 추가하세요.
          </p>
        ) : (
          <>
            {activeIds.length > 0 && (
              <Section label="진행 중">
                {activeIds.map((id) => (
                  <TaskRow
                    key={id}
                    taskId={id}
                    selected={id === selectedId}
                    onSelect={() => onSelect(id)}
                  />
                ))}
              </Section>
            )}
            {completedIds.length > 0 && (
              <Section label="완료">
                {completedIds.map((id) => (
                  <TaskRow
                    key={id}
                    taskId={id}
                    selected={id === selectedId}
                    onSelect={() => onSelect(id)}
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

/** 해당 id 작업만 구독 — 다른 작업 편집 시 이 행은 리렌더되지 않음 */
function TaskRow({
  taskId,
  selected,
  onSelect,
}: {
  taskId: string
  selected: boolean
  onSelect: () => void
}) {
  const task = useTaskStore((s) => s.tasks.find((t) => t.id === taskId))
  if (!task) return null

  const done = task.status === 'done'
  const dueLine = formatDueDateLabel(task.dueDate)

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={[
          'flex w-full flex-col gap-2 rounded-md px-2 py-2 text-left transition-colors',
          selected ? 'bg-zinc-200 dark:bg-zinc-800/90' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900',
        ].join(' ')}
      >
        <span
          className={[
            'truncate text-sm font-medium leading-tight',
            done ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-900 dark:text-zinc-100',
          ].join(' ')}
        >
          {task.title}
        </span>
        {dueLine && (
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{dueLine}</span>
        )}
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
          {getCategoryTitle(task.categoryId)}
        </span>
        <ProgressDots currentStage={task.currentStage} done={done} />
      </button>
    </li>
  )
}
