import { useMemo, useState } from 'react'
import { NewTaskModal } from './components/NewTaskModal'
import { TaskDetail } from './components/TaskDetail'
import { TaskSidebar } from './components/TaskSidebar'
import { useTaskStore } from './store/taskStore'

export default function App() {
  const tasks = useTaskStore((s) => s.tasks)
  const addTask = useTaskStore((s) => s.addTask)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newOpen, setNewOpen] = useState(false)

  const resolvedId = useMemo(() => {
    if (selectedId != null && tasks.some((t) => t.id === selectedId)) {
      return selectedId
    }
    return tasks[0]?.id ?? null
  }, [tasks, selectedId])

  const selected = resolvedId ? tasks.find((t) => t.id === resolvedId) : undefined

  return (
    <div className="flex min-h-dvh">
      <TaskSidebar
        selectedId={resolvedId}
        onSelect={setSelectedId}
        onNewTask={() => setNewOpen(true)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {selected ? (
          <TaskDetail key={`${selected.id}-${selected.currentStage}`} task={selected} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm text-zinc-400">작업을 선택하거나 새 작업을 만드세요.</p>
          </div>
        )}
      </div>

      <NewTaskModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreate={(title, description) => {
          const id = addTask(title, description)
          setSelectedId(id)
        }}
      />
    </div>
  )
}
