/** `YYYY-MM-DD` → 로케일 표시, 빈 문자열이면 빈 문자열 반환 */
export function formatDueDateLabel(iso: string): string {
  if (!iso.trim()) return ''
  try {
    const d = new Date(`${iso.trim()}T12:00:00`)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString('ko-KR', { dateStyle: 'medium' })
  } catch {
    return iso
  }
}
