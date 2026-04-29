/** Vercel 등에 VITE_API_URL + VITE_API_SECRET 이 있으면 원격(D1) 동기화 사용 */
export function hasRemote(): boolean {
  const url = import.meta.env.VITE_API_URL?.trim()
  const secret = import.meta.env.VITE_API_SECRET?.trim()
  return Boolean(url && secret)
}
export function apiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '')
}