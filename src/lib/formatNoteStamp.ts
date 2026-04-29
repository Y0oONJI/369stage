/** ISO 시각 → `04/17` 형태 */
export function formatNoteStamp(iso: string): string {
  if (!iso.trim()) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${m}/${day}`
  } catch {
    return ''
  }
}
