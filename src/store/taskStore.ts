import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nextStage, isStageComplete } from '../lib/gates'
import type { ChecklistItem, Stage, Task } from '../types/task'

function emptyChecklists(): Task['checklist'] {
  return { 30: [], 60: [], 90: [] }
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
  addChecklistItem: (taskId: string, stage: Stage, text: string) => void
  updateChecklistItem: (
    taskId: string,
    stage: Stage,
    itemId: string,
    patch: Partial<Pick<ChecklistItem, 'text' | 'checked'>>,
  ) => void
  removeChecklistItem: (taskId: string, stage: Stage, itemId: string) => void
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (title, description) => {
        const id = newId()
        const task: Task = {
          id,
          title: title.trim() || '제목 없음',
          description: description.trim(),
          status: 'active',
          currentStage: 30,
          checklist: emptyChecklists(),
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
        const items = t.checklist[t.currentStage]
        if (!isStageComplete(items)) return
        const n = nextStage(t.currentStage)
        if (n === null) return
        set((s) => ({
          tasks: s.tasks.map((x) =>
            x.id === id ? { ...x, currentStage: n } : x,
          ),
        }))
      },

      markDone: (id) => {
        const t = get().tasks.find((x) => x.id === id)
        if (!t || t.status !== 'active' || t.currentStage !== 90) return
        if (!isStageComplete(t.checklist[90])) return
        set((s) => ({
          tasks: s.tasks.map((x) =>
            x.id === id ? { ...x, status: 'done' as const } : x,
          ),
        }))
      },

      addChecklistItem: (taskId, stage, text) => {
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
            if (t.currentStage !== stage) return t
            return {
              ...t,
              checklist: {
                ...t.checklist,
                [stage]: [...t.checklist[stage], item],
              },
            }
          }),
        }))
      },

      updateChecklistItem: (taskId, stage, itemId, patch) => {
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== taskId || t.status !== 'active') return t
            if (t.currentStage !== stage) return t
            return {
              ...t,
              checklist: {
                ...t.checklist,
                [stage]: t.checklist[stage].map((i) =>
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
              },
            }
          }),
        }))
      },

      removeChecklistItem: (taskId, stage, itemId) => {
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== taskId || t.status !== 'active') return t
            if (t.currentStage !== stage) return t
            return {
              ...t,
              checklist: {
                ...t.checklist,
                [stage]: t.checklist[stage].filter((i) => i.id !== itemId),
              },
            }
          }),
        }))
      },
    }),
    { name: '369stage-tasks' },
  ),
)
