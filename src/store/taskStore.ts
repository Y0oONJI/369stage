import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { hasRemote } from '../lib/remoteConfig'
import { isStageComplete, nextStage } from '../lib/gates'
import type { ChecklistItem, Task } from '../types/task'
import { migrateTasks } from './migrateTask'

function emptyChecklist(): Task['checklist'] {
  return []
}

function newId(): string {
  return crypto.randomUUID()
}

interface TaskStore {
  tasks: Task[]
  addTask: (title: string, description: string) => string
  updateTask: (
    id: string,
    patch: Partial<Pick<Task, 'title' | 'description'>>,
  ) => void
  deleteTask: (id: string) => void
  advanceStage: (id: string) => void
  markDone: (id: string) => void
  addChecklistItem: (taskId: string, text: string) => void
  updateChecklistItem: (
    taskId: string,
    itemId: string,
    patch: Partial<Pick<ChecklistItem, 'text' | 'checked'>>,
  ) => void
  removeChecklistItem: (taskId: string, itemId: string) => void
}

const createTaskSlice: StateCreator<TaskStore> = (set, get) => ({
  tasks: [],

  addTask: (title, description) => {
    const id = newId()
    const task: Task = {
      id,
      title: title.trim() || '제목 없음',
      description: description.trim(),
      status: 'active',
      currentStage: 30,
      checklist: emptyChecklist(),
    }
    set((s) => ({ tasks: [task, ...s.tasks] }))
    return id
  },

  updateTask: (id, patch) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id && t.status === 'active'
          ? {
              ...t,
              ...patch,
              title:
                patch.title !== undefined
                  ? patch.title.trim() || '제목 없음'
                  : t.title,
              description:
                patch.description !== undefined
                  ? patch.description.trim()
                  : t.description,
            }
          : t,
      ),
    }))
  },

  deleteTask: (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
  },

  advanceStage: (id) => {
    const t = get().tasks.find((x) => x.id === id)
    if (!t || t.status !== 'active') return
    if (t.currentStage === 90) return
    const n = nextStage(t.currentStage)
    if (n === null) return
    set((s) => ({
      tasks: s.tasks.map((x) => (x.id === id ? { ...x, currentStage: n } : x)),
    }))
  },

  markDone: (id) => {
    const t = get().tasks.find((x) => x.id === id)
    if (!t || t.status !== 'active' || t.currentStage !== 90) return
    if (!isStageComplete(t.checklist)) return
    set((s) => ({
      tasks: s.tasks.map((x) =>
        x.id === id ? { ...x, status: 'done' as const } : x,
      ),
    }))
  },

  addChecklistItem: (taskId, text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const item: ChecklistItem = {
      id: newId(),
      text: trimmed,
      checked: false,
    }
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id !== taskId || t.status !== 'active') return t
        if (t.currentStage !== 90) return t
        return {
          ...t,
          checklist: [...t.checklist, item],
        }
      }),
    }))
  },

  updateChecklistItem: (taskId, itemId, patch) => {
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id !== taskId || t.status !== 'active') return t
        if (t.currentStage !== 90) return t
        return {
          ...t,
          checklist: t.checklist.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  ...patch,
                  text:
                    patch.text !== undefined
                      ? patch.text.trim() || i.text
                      : i.text,
                }
              : i,
          ),
        }
      }),
    }))
  },

  removeChecklistItem: (taskId, itemId) => {
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id !== taskId || t.status !== 'active') return t
        if (t.currentStage !== 90) return t
        return {
          ...t,
          checklist: t.checklist.filter((i) => i.id !== itemId),
        }
      }),
    }))
  },
})

const persistedSlice = persist(createTaskSlice, {
  name: '369stage-tasks',
  merge: (persisted, current) => {
    const p = persisted as Partial<TaskStore> | undefined
    if (!p?.tasks) return current as TaskStore
    return {
      ...(current as TaskStore),
      tasks: migrateTasks(p.tasks),
    }
  },
})

export const useTaskStore = create<TaskStore>()(
  (hasRemote() ? createTaskSlice : persistedSlice) as StateCreator<TaskStore>,
)
