export type Stage = 30 | 60 | 90

export const STAGES: Stage[] = [30, 60, 90]

export const STAGE_LABELS: Record<Stage, string> = {
  30: '방향성 검증',
  60: '구조 검증',
  90: '디테일 검수',
}

export interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

/** 단계(30·60·90)별 메모 — 최종 체크리스트와 별개 */
export type DirectionNotes = Record<Stage, string>

export function emptyDirectionNotes(): DirectionNotes {
  return { 30: '', 60: '', 90: '' }
}

/** 90% → 완료(100%) 전환 시에만 쓰는 최종 체크리스트 */
export interface Task {
  id: string
  title: string
  /** 본문 (여러 줄) */
  description: string
  /** 목표일 등, `YYYY-MM-DD`. 없으면 빈 문자열 */
  dueDate: string
  /** 단계별 디렉션(메모). 체크리스트와 무관 */
  directionNotes: DirectionNotes
  status: 'active' | 'done'
  currentStage: Stage
  checklist: ChecklistItem[]
}
