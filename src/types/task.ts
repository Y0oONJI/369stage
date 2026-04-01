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

export interface Task {
  id: string
  title: string
  description: string
  status: 'active' | 'done'
  currentStage: Stage
  checklist: Record<Stage, ChecklistItem[]>
}
