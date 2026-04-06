import {
  emptyDirectionNotes,
  type ChecklistItem,
  type DirectionNotes,
  type Task,
} from '../types/task'

function parseDirectionNotes(raw: unknown): DirectionNotes {
  const base = emptyDirectionNotes()
  if (!raw || typeof raw !== 'object') return base
  const o = raw as Record<string, unknown>
  for (const s of [30, 60, 90] as const) {
    const v = o[String(s)]
    if (typeof v === 'string') base[s] = v
  }
  return base
}

/** 예전: checklist가 단계별 Record → 90% 배열만 유지 */
export function migrateTask(raw: unknown): Task {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid task payload')
  }
  const t = raw as Record<string, unknown>
  const checklist = t.checklist

  const dueDate =
    typeof t.dueDate === 'string' ? t.dueDate : ''

  const directionNotes = parseDirectionNotes(t.directionNotes)

  if (Array.isArray(checklist)) {
    return { ...(raw as Task), dueDate, directionNotes }
  }

  if (checklist && typeof checklist === 'object' && '90' in checklist) {
    const items = (checklist as Record<string, ChecklistItem[]>)[90]
    return {
      ...(raw as Task),
      checklist: Array.isArray(items) ? items : [],
      dueDate,
      directionNotes,
    }
  }

  return { ...(raw as Task), checklist: [], dueDate, directionNotes }
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
