import type { ChecklistItem, DirectionNotes, Task } from '../types/task'
import { emptyDirectionNotes } from '../types/task'

function normalizeDirectionNotes(raw: unknown): DirectionNotes {
  const d = raw as Record<string, unknown> | null | undefined
  if (!d || typeof d !== 'object') return emptyDirectionNotes()
  return {
    30: typeof d[30] === 'string' ? d[30] : '',
    60: typeof d[60] === 'string' ? d[60] : '',
    90: typeof d[90] === 'string' ? d[90] : '',
  }
}

/** 예전: checklist가 단계별 Record → 90% 배열만 유지. directionNotes 없으면 빈 객체 */
export function migrateTask(raw: unknown): Task {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid task payload')
  }
  const t = raw as Record<string, unknown>
  const checklist = t.checklist

  let next: Task

  if (Array.isArray(checklist)) {
    next = raw as Task
  } else if (checklist && typeof checklist === 'object' && '90' in checklist) {
    const items = (checklist as Record<string, ChecklistItem[]>)[90]
    next = {
      ...(raw as Task),
      checklist: Array.isArray(items) ? items : [],
    }
  } else {
    next = { ...(raw as Task), checklist: [] }
  }

  return {
    ...next,
    directionNotes: normalizeDirectionNotes(next.directionNotes),
  }
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
