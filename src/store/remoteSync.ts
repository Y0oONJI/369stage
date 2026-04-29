import { fetchTasks, saveTasks } from '../lib/api'
import { hasRemote } from '../lib/remoteConfig'
import { migrateTasks } from './migrateTask'
import { useTaskStore } from './taskStore'

const DEBOUNCE_MS = 650
/** 다른 PC에서 저장한 내용을 열린 탭에서도 보이게 하기 위한 서버 재조회 간격 */
const DEFAULT_POLL_INTERVAL_MS = 30_000

export function isRemoteConfigured(): boolean {
  return hasRemote()
}

/**
 * 서버 스냅샷으로 메모리 상태를 맞춤.
 * 서버가 비어 있고 로컬(persist)에만 작업이 있으면 서버로 한 번 올려 동기화하고, 로컬은 유지.
 */
export async function hydrateRemoteTasks(): Promise<void> {
  const raw = await fetchTasks()
  const data = raw as { tasks?: unknown }
  const list = Array.isArray(data.tasks) ? data.tasks : []
  const serverTasks = migrateTasks(list)
  const localTasks = useTaskStore.getState().tasks
  if (serverTasks.length === 0 && localTasks.length > 0) {
    try {
      await saveTasks(localTasks)
    } catch {
      // 서버 반영 실패 시에도 로컬 persist 상태는 그대로 두고 덮어쓰지 않음
    }
    return
  }
  useTaskStore.setState({ tasks: serverTasks })
}

export type RemoteSaveFailureHandler = (message: string | null) => void

export function subscribeRemoteSave(
  onSaveResult?: RemoteSaveFailureHandler,
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastSaved = JSON.stringify(useTaskStore.getState().tasks)
  const unsub = useTaskStore.subscribe(() => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      const latest = useTaskStore.getState().tasks
      const snap = JSON.stringify(latest)
      if (snap === lastSaved) return
      saveTasks(latest)
        .then(() => {
          lastSaved = snap
          onSaveResult?.(null)
        })
        .catch((e) => {
          console.error('[369stage] remote save failed', e)
          onSaveResult?.(e instanceof Error ? e.message : String(e))
        })
    }, DEBOUNCE_MS)
  })
  return () => {
    if (timer) clearTimeout(timer)
    unsub()
  }
}

/**
 * 주기적으로 GET /tasks 로 서버 상태를 다시 받아 메모리에 반영하고,
 * 탭이 다시 보이면(다른 기기에서 작업 후 돌아올 때) 즉시 한 번 더 받는다.
 */
export function subscribeRemotePolling(
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
): () => void {
  let intervalId: ReturnType<typeof setInterval> | null = null
  const tick = () => {
    void hydrateRemoteTasks().catch((e) => {
      console.warn('[369stage] remote poll failed', e)
    })
  }
  intervalId = setInterval(tick, pollIntervalMs)
  const onVisibility = () => {
    if (document.visibilityState === 'visible') tick()
  }
  document.addEventListener('visibilitychange', onVisibility)
  return () => {
    if (intervalId) clearInterval(intervalId)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
