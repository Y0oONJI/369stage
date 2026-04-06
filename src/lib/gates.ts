import type { ChecklistItem, Stage } from '../types/task'

/** 90% → 100% 최종 체크리스트: 항목 1개 이상 + 전부 체크 */
export function isStageComplete(items: ChecklistItem[]): boolean {
  return items.length > 0 && items.every((i) => i.checked)
}

export function nextStage(current: Stage): Stage | null {
  if (current === 30) return 60
  if (current === 60) return 90
  return null
}
