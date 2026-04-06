import type { StateStorage } from 'zustand/middleware'

/** persist가 매 set마다 동기 저장할 때 생기는 메인 스레드 부담을 줄임 */
export function createDebouncedLocalStorage(delayMs = 400): StateStorage {
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  const pending = new Map<string, string>()

  return {
    getItem: (name) => localStorage.getItem(name),
    setItem: (name, value) => {
      pending.set(name, value)
      const prev = timers.get(name)
      if (prev) clearTimeout(prev)
      timers.set(
        name,
        setTimeout(() => {
          timers.delete(name)
          const v = pending.get(name)
          if (v !== undefined) localStorage.setItem(name, v)
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
