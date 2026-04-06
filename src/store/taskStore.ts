import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { isStageComplete, nextStage } from '../lib/gates'
import {
  emptyDirectionNotes,
  type ChecklistItem,
  type Stage,
  type Task,
} from '../types/task'
import { migrateTasks } from './migrateTask'

function emptyChecklist(): Task['checklist'] {
  return []
}

function newId(): string {
  return crypto.randomUUID()
}

interface TaskStore {
  tasks: Task[]
  addTask: (title: string, description: string, dueDate: string) => string
  updateTask: (
    id: string,
    patch: Partial<Pick<Task, 'title' | 'description' | 'dueDate'>>,
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
  setDirectionNote: (taskId: string, stage: Stage, text: string) => void
}

const createTaskSlice: StateCreator<TaskStore> = (set, get) => ({
  tasks: [],

  addTask: (title, description, dueDate) => {
    const id = newId()
    const task: Task = {
      id,
      title: title.trim() || '제목 없음',
      description: description.trim(),
      dueDate: dueDate.trim(),
      directionNotes: emptyDirectionNotes(),
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
              dueDate:
                patch.dueDate !== undefined
                  ? patch.dueDate.trim()
                  : t.dueDate,
            }
          : t,
      ),
    }))
  },

  deleteTask: (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
  },

  /** 30→60, 60→90는 체크리스트 없이 이동 */
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

  /** 90% 최종 체크리스트 충족 시에만 완료 */
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

  setDirectionNote: (taskId, stage, text) => {
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id !== taskId || t.status !== 'active') return t
        return {
          ...t,
          directionNotes: {
            ...t.directionNotes,
            [stage]: text,
          },
        }
      }),
    }))
  },
})

/** 원격 사용 여부와 관계없이 `tasks`는 localStorage에 백업 (저장 실패·새로고침 대비) */
export const useTaskStore = create<TaskStore>()(
  persist(createTaskSlice, {
    name: '369stage-tasks',
    partialize: (state) => ({ tasks: state.tasks }),
    merge: (persisted, current) => {
      const p = persisted as Partial<Pick<TaskStore, 'tasks'>> | undefined
      if (!p?.tasks) return current as TaskStore
      return {
        ...(current as TaskStore),
        tasks: migrateTasks(p.tasks),
      }
    },
  }),
)
