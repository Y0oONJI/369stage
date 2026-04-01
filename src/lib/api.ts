import type { Task } from '../types/task'
import { apiBaseUrl } from './remoteConfig'

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${import.meta.env.VITE_API_SECRET ?? ''}`,
  }
}

export async function fetchTasks(): Promise<unknown> {
  const res = await fetch(`${apiBaseUrl()}/tasks`, {
    headers: authHeaders(),
  })
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
  if (!res.ok) {
    throw new Error(`저장에 실패했습니다 (${res.status})`)
  }
}
