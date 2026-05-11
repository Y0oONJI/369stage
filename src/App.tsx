import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { NewTaskModal } from './components/NewTaskModal'
import { TaskDetail } from './components/TaskDetail'
import { TaskSidebar } from './components/TaskSidebar'
import { AuthError, createSession, hasSessionToken } from './lib/api'
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
  const [isAuthorized, setIsAuthorized] = useState(!useRemote || hasSessionToken())
  const [accessCode, setAccessCode] = useState('')
  const [authPending, setAuthPending] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const [remoteReady, setRemoteReady] = useState(!useRemote || !isAuthorized)
  /** 원격 불러오기 성공 시에만 자동 저장 (실패 시 빈 목록으로 서버를 덮지 않음) */
  const [remoteCanSave, setRemoteCanSave] = useState(!useRemote || !isAuthorized)
  const [remoteError, setRemoteError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newOpen, setNewOpen] = useState(false)

  /** localStorage(persist) 복원 후에만 서버와 맞춤 */
  useEffect(() => {
    if (!useRemote) {
      setIsAuthorized(true)
      return
    }
    setIsAuthorized(hasSessionToken())
  }, [useRemote])

  useEffect(() => {
    if (!useRemote) return
    if (!isAuthorized) {
      setRemoteReady(true)
      setRemoteCanSave(false)
      return
    }

    let cancelled = false
    setRemoteReady(false)
    const runHydrate = async () => {
      try {
        await hydrateRemoteTasks()
        if (!cancelled) {
          setAuthError(null)
          setRemoteError(null)
          setRemoteCanSave(true)
        }
      } catch (e) {
        if (!cancelled) {
          if (e instanceof AuthError) {
            setIsAuthorized(false)
            setAuthError(e.message)
          } else {
            setRemoteError(e instanceof Error ? e.message : String(e))
          }
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
  }, [useRemote, isAuthorized])

  useEffect(() => {
    if (!useRemote || !isAuthorized || !remoteReady || !remoteCanSave) return
    return subscribeRemoteSave((msg) => setSaveError(msg))
  }, [useRemote, isAuthorized, remoteReady, remoteCanSave])

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

  if (useRemote && !isAuthorized) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <form
          className="w-full max-w-sm space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5"
          onSubmit={(e) => {
            e.preventDefault()
            const code = accessCode.trim()
            if (!code || authPending) return
            setAuthPending(true)
            setAuthError(null)
            createSession(code)
              .then(() => {
                setAccessCode('')
                setIsAuthorized(true)
              })
              .catch((err: unknown) => {
                setAuthError(err instanceof Error ? err.message : String(err))
              })
              .finally(() => {
                setAuthPending(false)
              })
          }}
        >
          <h1 className="text-base font-semibold text-zinc-100">접근 코드 입력</h1>
          <p className="text-xs text-zinc-400">
            여러 기기에서 동일한 데이터를 보려면 접근 코드를 입력해주세요.
          </p>
          <input
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
            type="password"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="Access code"
            autoComplete="off"
          />
          {authError && <p className="text-xs text-amber-300">{authError}</p>}
          <button
            className="w-full rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={authPending || !accessCode.trim()}
          >
            {authPending ? '확인 중…' : '접속'}
          </button>
        </form>
      </div>
    )
  }

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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
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
