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

/** 단계별로 사용자가 직접 적는 ‘다른 사람 디렉션’ 메모 (DB 템플릿 체크리스트와 별개) */
export type DirectionNotes = Record<Stage, string>

export function emptyDirectionNotes(): DirectionNotes {
  return { 30: '', 60: '', 90: '' }
}

/** 90% → 완료(100%) 최종 체크리스트 (템플릿에서 채울 항목 + 체크) */
export interface Task {
  id: string
  title: string
  description: string
  status: 'active' | 'done'
  currentStage: Stage
  directionNotes: DirectionNotes
  checklist: ChecklistItem[]
}
