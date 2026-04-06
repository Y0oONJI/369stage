import { useEffect, useMemo, useState } from 'react'
import { NewTaskModal } from './components/NewTaskModal'
import { TaskDetail } from './components/TaskDetail'
import { TaskSidebar } from './components/TaskSidebar'
import { hydrateRemoteTasks, isRemoteConfigured, subscribeRemoteSave } from './store/remoteSync'
import { useTaskStore } from './store/taskStore'

export default function App() {
  const tasks = useTaskStore((s) => s.tasks)
  const addTask = useTaskStore((s) => s.addTask)

  const useRemote = isRemoteConfigured()
  const [remoteReady, setRemoteReady] = useState(!useRemote)
  const [remoteCanSave, setRemoteCanSave] = useState(!useRemote)
  const [remoteError, setRemoteError] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newOpen, setNewOpen] = useState(false)

  useEffect(() => {
    if (!useRemote) return
    let cancelled = false
    ;(async () => {
      try {
        await hydrateRemoteTasks()
        if (!cancelled) {
          setRemoteError(null)
          setRemoteCanSave(true)
        }
      } catch (e) {
        if (!cancelled) {
          setRemoteError(e instanceof Error ? e.message : String(e))
          setRemoteCanSave(false)
        }
      } finally {
        if (!cancelled) setRemoteReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [useRemote])

  useEffect(() => {
    if (!useRemote || !remoteReady || !remoteCanSave) return
    return subscribeRemoteSave()
  }, [useRemote, remoteReady, remoteCanSave])

  const resolvedId = useMemo(() => {
    if (selectedId != null && tasks.some((t) => t.id === selectedId)) {
      return selectedId
    }
    return tasks[0]?.id ?? null
  }, [tasks, selectedId])

  const selected = resolvedId ? tasks.find((t) => t.id === resolvedId) : undefined

  if (useRemote && !remoteReady) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-zinc-50 px-6 text-center">
        <p className="text-sm text-zinc-600">서버에서 작업을 불러오는 중…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh bg-zinc-50">
      {remoteError && (
        <div className="fixed bottom-4 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900 shadow-sm">
          원격 불러오기 실패: {remoteError} (로컬 편집은 계속됩니다)
        </div>
      )}

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
            <p className="text-sm text-zinc-500">작업을 선택하거나 새 작업을 만드세요.</p>
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
