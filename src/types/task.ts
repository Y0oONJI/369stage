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

/** 90% → 완료(100%) 전환 시에만 쓰는 최종 체크리스트 */
export interface Task {
  id: string
  title: string
  description: string
  status: 'active' | 'done'
  currentStage: Stage
  checklist: ChecklistItem[]
}
