import { useMemo, useState } from 'react'
import { useTaskStore } from '../store/taskStore'
import { CalendarErrorBoundary } from './CalendarErrorBoundary'
import { CalendarGrid } from './CalendarGrid'
import { CalendarHeader } from './CalendarHeader'
import { TaskDetailModal } from './TaskDetailModal'
import { UnscheduledPanel } from './UnscheduledPanel'

type Props = {
  onNewTask: (defaultStartDate?: string) => void
  onToggleView: () => void
}

type CalendarTask = { id: string; title: string; startDate: string; dueDate: string }

export function CalendarView({ onNewTask, onToggleView }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const rawTasks = useTaskStore((s) => s.tasks)
  const activeTasks = useMemo(
    () =>
      rawTasks
        .filter((t) => t.status === 'active')
        .map((t): CalendarTask => ({
          id: t.id,
          title: t.title,
          startDate: t.startDate ?? '',
          dueDate: t.dueDate ?? '',
        })),
    [rawTasks],
  )

  function goPrev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function goNext() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function goToday() {
    const t = new Date()
    setYear(t.getFullYear())
    setMonth(t.getMonth())
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-950">
      <CalendarHeader
        year={year}
        month={month}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        onNewTask={() => onNewTask()}
        onToggleView={onToggleView}
      />
      <div className="flex flex-1 overflow-hidden">
        <CalendarGrid
          year={year}
          month={month}
          tasks={activeTasks}
          onSelectTask={setSelectedTaskId}
        />
        <UnscheduledPanel
          tasks={activeTasks.filter((t) => !t.startDate && !t.dueDate)}
          onSelectTask={setSelectedTaskId}
        />
      </div>

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  )
}
