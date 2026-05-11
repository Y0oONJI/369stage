import {
  emptyDirectionNotes,
  type ChecklistItem,
  type DirectionNoteItem,
  type DirectionNotes,
  type QaCategoryId,
  type Task,
} from '../types/task'

function migrateStageDirectionList(v: unknown): DirectionNoteItem[] {
  if (typeof v === 'string') {
    if (!v.trim()) return []
    const now = new Date().toISOString()
    return [
      {
        id: crypto.randomUUID(),
        text: v.trim(),
        createdAt: now,
        updatedAt: now,
      },
    ]
  }
  if (!Array.isArray(v)) return []
  const out: DirectionNoteItem[] = []
  for (const item of v) {
    if (!item || typeof item !== 'object') continue
    const i = item as Record<string, unknown>
    const id = typeof i.id === 'string' ? i.id : crypto.randomUUID()
    const text = typeof i.text === 'string' ? i.text : ''
    const createdAt =
      typeof i.createdAt === 'string' ? i.createdAt : new Date().toISOString()
    const updatedAt =
      typeof i.updatedAt === 'string' ? i.updatedAt : createdAt
    out.push({ id, text, createdAt, updatedAt })
  }
  return out
}

function parseDirectionNotes(raw: unknown): DirectionNotes {
  const base = emptyDirectionNotes()
  if (!raw || typeof raw !== 'object') return base
  const o = raw as Record<string, unknown>
  for (const s of [30, 60, 90] as const) {
    base[s] = migrateStageDirectionList(o[String(s)])
  }
  return base
}

function parseCategoryId(raw: unknown): QaCategoryId {
  if (
    raw === 'common' || raw === 'ui' || raw === 'print' ||
    raw === 'video' || raw === 'photo' || raw === 'mockup' ||
    raw === 'ppt' || raw === 'web' || raw === 'sns' || raw === 'dpp'
  ) return raw
  return 'common'
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

  const categoryId = parseCategoryId(t.categoryId)

  const directionNotes = parseDirectionNotes(t.directionNotes)

  if (Array.isArray(checklist)) {
    return { ...(raw as Task), dueDate, directionNotes, categoryId }
  }

  if (checklist && typeof checklist === 'object' && '90' in checklist) {
    const items = (checklist as Record<string, ChecklistItem[]>)[90]
    return {
      ...(raw as Task),
      checklist: Array.isArray(items) ? items : [],
      dueDate,
      directionNotes,
      categoryId,
    }
  }

  return { ...(raw as Task), checklist: [], dueDate, directionNotes, categoryId }
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
