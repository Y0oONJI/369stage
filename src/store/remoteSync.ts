import { fetchTasks, saveTasks } from '../lib/api'
import { hasRemote } from '../lib/remoteConfig'
import { migrateTasks } from './migrateTask'
import { useTaskStore } from './taskStore'

const DEBOUNCE_MS = 650

export function isRemoteConfigured(): boolean {
  return hasRemote()
}

export async function hydrateRemoteTasks(): Promise<void> {
  const raw = await fetchTasks()
  const data = raw as { tasks?: unknown }
  const list = Array.isArray(data.tasks) ? data.tasks : []
  useTaskStore.setState({ tasks: migrateTasks(list) })
}

export function subscribeRemoteSave(): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastSaved = JSON.stringify(useTaskStore.getState().tasks)

  const unsub = useTaskStore.subscribe((state) => {
    const serialized = JSON.stringify(state.tasks)
    if (serialized === lastSaved) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      saveTasks(state.tasks)
        .then(() => {
          lastSaved = serialized
        })
        .catch((e) => {
          console.error('[369stage] remote save failed', e)
        })
    }, DEBOUNCE_MS)
  })

  return () => {
    if (timer) clearTimeout(timer)
    unsub()
  }
}
