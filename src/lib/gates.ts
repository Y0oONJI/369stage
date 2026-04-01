import type { ChecklistItem, Stage } from '../types/task'

/** 한 단계를 통과로 보려면 항목이 하나 이상이고 모두 체크되어야 함 */
export function isStageComplete(items: ChecklistItem[]): boolean {
  return items.length > 0 && items.every((i) => i.checked)
}

export function nextStage(current: Stage): Stage | null {
  if (current === 30) return 60
  if (current === 60) return 90
  return null
}
