/** qa_practical.md 카테고리 id와 동일 */
export type QaCategoryId = 'common' | 'ui' | 'print' | 'video' | 'photo' | 'mockup' | 'ppt' | 'web' | 'sns' | 'dpp'

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
  /** 짧은 라벨 (QA 템플릿) */
  label?: string
  /** 섹션 제목 — UI에서 그룹 헤더 */
  sectionTitle?: string
  /** 카테고리 내 섹션·항목 순번 표시 (예: 1-1, 2-3) */
  displayCode?: string
}

/** 단계별 디렉션 노트 한 줄(저장 단위) */
export interface DirectionNoteItem {
  id: string
  text: string
  createdAt: string
  updatedAt: string
}

/** 단계(30·60·90)별 노트 목록 — 최종 체크리스트와 별개 */
export type DirectionNotes = Record<Stage, DirectionNoteItem[]>

export function emptyDirectionNotes(): DirectionNotes {
  return { 30: [], 60: [], 90: [] }
}

/** 90% → 완료(100%) 전환 시에만 쓰는 최종 체크리스트 */
export interface Task {
  id: string
  title: string
  /** 본문 (여러 줄) */
  description: string
  /** 목표일 등, `YYYY-MM-DD`. 없으면 빈 문자열 */
  dueDate: string
  /** QA 체크리스트 카테고리 — 생성 시 선택, 이후 변경 없음 */
  categoryId: QaCategoryId
  /** 단계별 디렉션 노트 목록 */
  directionNotes: DirectionNotes
  status: 'active' | 'done'
  currentStage: Stage
  checklist: ChecklistItem[]
}
