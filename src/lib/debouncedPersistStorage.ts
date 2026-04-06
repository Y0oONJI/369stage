import type { PersistStorage, StorageValue } from 'zustand/middleware'
import type { Task } from '../types/task'

type Persisted = { tasks: Task[] }

/**
 * createJSONStorage + debounced localStorage는 여전히 매 set마다 동기 JSON.stringify가 돌아감.
 * persist에 넘기는 PersistStorage에서 stringify+쓰기를 함께 디바운스한다.
 */
export function createDebouncedPersistStorage(
  delayMs = 400,
): PersistStorage<Persisted> {
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  const pending = new Map<string, StorageValue<Persisted>>()

  function flushName(name: string) {
    const prev = timers.get(name)
    if (prev) clearTimeout(prev)
    timers.delete(name)
    const v = pending.get(name)
    if (v !== undefined) {
      localStorage.setItem(name, JSON.stringify(v))
      pending.delete(name)
    }
  }

  function flushAll() {
    for (const name of [...new Set([...timers.keys(), ...pending.keys()])]) {
      flushName(name)
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flushAll)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushAll()
    })
  }

  return {
    getItem: (name) => {
      const str = localStorage.getItem(name)
      if (str === null) return null
      try {
        return JSON.parse(str) as StorageValue<Persisted>
      } catch {
        return null
      }
    },
    setItem: (name, value) => {
      pending.set(name, value)
      const prev = timers.get(name)
      if (prev) clearTimeout(prev)
      timers.set(
        name,
        setTimeout(() => {
          flushName(name)
        }, delayMs),
      )
    },
    removeItem: (name) => {
      const prev = timers.get(name)
      if (prev) clearTimeout(prev)
      timers.delete(name)
      pending.delete(name)
      localStorage.removeItem(name)
    },
  }
}
