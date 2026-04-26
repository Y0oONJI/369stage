/** Vercel 등에 VITE_API_URL 이 있으면 원격(D1) 동기화 사용 */
export function hasRemote(): boolean {
  const url = import.meta.env.VITE_API_URL?.trim()
  return Boolean(url)
}

export function apiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '')
}
