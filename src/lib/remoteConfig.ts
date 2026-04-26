export function hasRemote(): boolean {
  const url = import.meta.env.VITE_API_URL?.trim()
  const secret = import.meta.env.VITE_API_SECRET?.trim()
  return Boolean(url && secret)
}

export function apiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '')
}
