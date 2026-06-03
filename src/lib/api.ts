import type { Task } from '../types/task'
import { apiBaseUrl } from './remoteConfig'

export const SESSION_TOKEN_KEY = '369stage-session-token'

export class AuthError extends Error {}

function getSessionToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(SESSION_TOKEN_KEY)?.trim() ?? ''
}

export function clearSessionToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_TOKEN_KEY)
}

export function saveSessionToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_TOKEN_KEY, token)
}

export function hasSessionToken(): boolean {
  return Boolean(getSessionToken())
}

function authHeaders(): HeadersInit {
  const token = getSessionToken()
  return {
    Authorization: `Bearer ${token}`,
  }
}

async function parseJsonOrNull(res: Response): Promise<unknown> {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export async function createSession(accessCode: string): Promise<void> {
  const res = await fetch(`${apiBaseUrl()}/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessCode }),
  })
  if (res.status === 401) {
    throw new AuthError('접근 코드가 올바르지 않습니다.')
  }
  if (!res.ok) {
    throw new Error(`인증에 실패했습니다 (${res.status})`)
  }
  const data = (await parseJsonOrNull(res)) as { token?: unknown } | null
  const token = typeof data?.token === 'string' ? data.token.trim() : ''
  if (!token) {
    throw new Error('인증 응답에 토큰이 없습니다.')
  }
  saveSessionToken(token)
}

export async function fetchTasks(): Promise<unknown> {
  const res = await fetch(`${apiBaseUrl()}/tasks`, {
    headers: authHeaders(),
  })
  if (res.status === 401) {
    clearSessionToken()
    throw new AuthError('인증이 만료되었습니다. 접근 코드를 다시 입력해주세요.')
  }
  if (!res.ok) {
    throw new Error(`작업 목록을 불러오지 못했습니다 (${res.status})`)
  }
  return res.json()
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  const res = await fetch(`${apiBaseUrl()}/tasks`, {
    method: 'PUT',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tasks }),
  })
  if (res.status === 401) {
    clearSessionToken()
    throw new AuthError('인증이 만료되었습니다. 접근 코드를 다시 입력해주세요.')
  }
  if (!res.ok) {
    throw new Error(`저장에 실패했습니다 (${res.status})`)
  }
}
