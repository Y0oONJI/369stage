import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { NewTaskModal } from './components/NewTaskModal'
import { TaskDetail } from './components/TaskDetail'
import { TaskSidebar } from './components/TaskSidebar'
import {
  hydrateRemoteTasks,
  isRemoteConfigured,
  subscribeRemotePolling,
  subscribeRemoteSave,
} from './store/remoteSync'
import { useTaskStore } from './store/taskStore'

export default function App() {
  const taskIds = useTaskStore(useShallow((s) => s.tasks.map((t) => t.id)))
  const addTask = useTaskStore((s) => s.addTask)

  const useRemote = isRemoteConfigured()
  const [remoteReady, setRemoteReady] = useState(!useRemote)
  const [remoteCanSave, setRemoteCanSave] = useState(!useRemote)
  const [remoteError, setRemoteError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newOpen, setNewOpen] = useState(false)

  /** localStorage(persist) 복원 후에만 서버와 맞춤 */
  useEffect(() => {
    if (!useRemote) {
      setRemoteReady(true)
      return
    }
    let cancelled = false
    const runHydrate = async () => {
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
    }

    const { persist } = useTaskStore
    if (persist.hasHydrated()) {
      void runHydrate()
      return () => { cancelled = true }
    }

    const unsub = persist.onFinishHydration(() => {
      void runHydrate()
    })
    return () => {
      cancelled = true
      unsub()
    }
  }, [useRemote])

  useEffect(() => {
    if (!useRemote || !remoteReady || !remoteCanSave) return
    return subscribeRemoteSave((msg) => setSaveError(msg))
  }, [useRemote, remoteReady, remoteCanSave])

  /** 다른 PC에서 PUT 된 내용을 주기·탭 복귀 시 서버에서 다시 받아옴 */
  useEffect(() => {
    if (!useRemote || !remoteReady) return
    return subscribeRemotePolling()
  }, [useRemote, remoteReady])

  const resolvedId = useMemo(() => {
    if (selectedId != null && taskIds.includes(selectedId)) return selectedId
    return taskIds[0] ?? null
  }, [taskIds, selectedId])

  const selectedStage = useTaskStore((s) =>
    resolvedId ? s.tasks.find((t) => t.id === resolvedId)?.currentStage : undefined,
  )

  if (useRemote && !remoteReady) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-zinc-50 px-6 text-center dark:bg-zinc-950">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">서버에서 작업을 불러오는 중…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh">
      {remoteError && (
        <div className="fixed bottom-4 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-950 dark:border-amber-900/80 dark:bg-amber-950/90 dark:text-amber-200">
          원격 불러오기 실패: {remoteError} (로컬 편집은 계속됩니다)
        </div>
      )}
      {saveError && (
        <div className="fixed bottom-16 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-center text-xs text-red-900 dark:border-red-900/80 dark:bg-red-950/90 dark:text-red-200">
          서버 저장 실패: {saveError}. 새로고침 전에 네트워크를 확인하세요.
        </div>
      )}

      <TaskSidebar
        selectedId={resolvedId}
        onSelect={setSelectedId}
        onNewTask={() => setNewOpen(true)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {resolvedId != null ? (
          <TaskDetail
            key={`${resolvedId}-${selectedStage ?? 30}`}
            taskId={resolvedId}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">작업을 선택하거나 새 작업을 만드세요.</p>
          </div>
        )}
      </div>

      <NewTaskModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreate={(title, description, dueDate, categoryId) => {
          const id = addTask(title, description, dueDate, categoryId)
          setSelectedId(id)
        }}
      />
    </div>
  )
}
