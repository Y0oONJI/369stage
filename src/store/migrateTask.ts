import type { ChecklistItem, Task } from '../types/task'

/** 예전: checklist가 단계별 Record → 90% 배열만 유지 */
export function migrateTask(raw: unknown): Task {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid task payload')
  }
  const t = raw as Record<string, unknown>
  const checklist = t.checklist

  if (Array.isArray(checklist)) {
    return raw as Task
  }

  if (checklist && typeof checklist === 'object' && '90' in checklist) {
    const items = (checklist as Record<string, ChecklistItem[]>)[90]
    return {
      ...(raw as Task),
      checklist: Array.isArray(items) ? items : [],
    }
  }

  return { ...(raw as Task), checklist: [] }
}

export function migrateTasks(tasks: unknown): Task[] {
  if (!Array.isArray(tasks)) return []
  return tasks.map((x) => {
    try {
      return migrateTask(x)
    } catch {
      return null
    }
  }).filter((t): t is Task => t !== null)
}
