export interface Env {
  DB: D1Database
  SESSION_SIGNING_SECRET: string
  ACCESS_CODE?: string
  /** Optional sha256 hex of access code */
  ACCESS_CODE_HASH?: string
  /** Comma-separated origins; if empty, allow any origin for preflight */
  CORS_ORIGINS?: string
}

type TaskRow = {
  id: string
  title: string
  description: string
  status: 'active' | 'done'
  current_stage: 30 | 60 | 90
  checklist_json: string
}

type SessionPayload = {
  exp: number
}

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

function corsHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get('Origin')
  const list = env.CORS_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean) ?? []
  const allow =
    list.length === 0 || list.includes('*')
      ? '*'
      : origin && list.includes(origin)
        ? origin
        : list[0] ?? '*'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

function unauthorized(request: Request, env: Env): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' },
  })
}

function badRequest(msg: string, request: Request, env: Env): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status: 400,
    headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' },
  })
}

function serverError(msg: string, request: Request, env: Env): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status: 500,
    headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' },
  })
}

function jsonResponse(data: unknown, request: Request, env: Env, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' },
  })
}

function methodNotAllowed(request: Request, env: Env): Response {
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
    status: 405,
    headers: { ...corsHeaders(request, env), 'Content-Type': 'application/json' },
  })
}

function extractBearerToken(request: Request): string | null {
  const h = request.headers.get('Authorization') ?? ''
  const m = /^Bearer\s+(.+)$/i.exec(h)
  return m?.[1]?.trim() || null
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(input: string): Uint8Array | null {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const binary = atob(padded)
    const out = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i)
    return out
  } catch {
    return null
  }
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function isValidAccessCode(accessCode: string, env: Env): Promise<boolean> {
  const normalized = accessCode.trim()
  if (!normalized) return false

  if (env.ACCESS_CODE_HASH?.trim()) {
    const inputHash = await sha256Hex(normalized)
    return constantTimeEqual(inputHash, env.ACCESS_CODE_HASH.trim().toLowerCase())
  }

  if (env.ACCESS_CODE?.trim()) {
    return constantTimeEqual(normalized, env.ACCESS_CODE.trim())
  }

  return false
}

async function signHmacSha256(input: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(input))
  return toBase64Url(new Uint8Array(sig))
}

async function createSessionToken(secret: string): Promise<{ token: string; exp: number }> {
  const header = toBase64Url(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({ exp } satisfies SessionPayload)))
  const signingInput = `${header}.${payload}`
  const signature = await signHmacSha256(signingInput, secret)
  return { token: `${signingInput}.${signature}`, exp }
}

async function verifySessionToken(token: string, secret: string): Promise<SessionPayload | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [header, payload, signature] = parts
  const expectedSig = await signHmacSha256(`${header}.${payload}`, secret)
  if (!constantTimeEqual(signature, expectedSig)) return null

  const payloadBytes = fromBase64Url(payload)
  if (!payloadBytes) return null

  try {
    const parsed = JSON.parse(new TextDecoder().decode(payloadBytes)) as Partial<SessionPayload>
    if (typeof parsed.exp !== 'number') return null
    if (parsed.exp <= Math.floor(Date.now() / 1000)) return null
    return { exp: parsed.exp }
  } catch {
    return null
  }
}

function rowToTask(row: TaskRow) {
  let checklist: unknown = []
  try {
    checklist = JSON.parse(row.checklist_json || '[]')
  } catch {
    checklist = []
  }
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    currentStage: row.current_stage,
    checklist,
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const baseHeaders = corsHeaders(request, env)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: baseHeaders })
    }

    const url = new URL(request.url)
    if (url.pathname === '/auth/session') {
      if (request.method !== 'POST') return methodNotAllowed(request, env)
      if (!env.SESSION_SIGNING_SECRET?.trim()) {
        return serverError('Server misconfigured: missing SESSION_SIGNING_SECRET', request, env)
      }
      if (!env.ACCESS_CODE?.trim() && !env.ACCESS_CODE_HASH?.trim()) {
        return serverError('Server misconfigured: missing ACCESS_CODE or ACCESS_CODE_HASH', request, env)
      }

      let body: unknown
      try {
        body = await request.json()
      } catch {
        return badRequest('Invalid JSON', request, env)
      }
      const accessCode =
        body && typeof body === 'object' && 'accessCode' in body
          ? (body as { accessCode?: unknown }).accessCode
          : null
      if (typeof accessCode !== 'string') {
        return badRequest('Expected { accessCode: string }', request, env)
      }

      if (!(await isValidAccessCode(accessCode, env))) {
        return unauthorized(request, env)
      }

      const { token, exp } = await createSessionToken(env.SESSION_SIGNING_SECRET)
      return jsonResponse({ token, expiresAt: exp }, request, env)
    }

    if (url.pathname !== '/tasks' && url.pathname !== '/tasks/') {
      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { ...baseHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!env.SESSION_SIGNING_SECRET?.trim()) {
      return serverError('Server misconfigured: missing SESSION_SIGNING_SECRET', request, env)
    }

    const token = extractBearerToken(request)
    if (!token) return unauthorized(request, env)
    const session = await verifySessionToken(token, env.SESSION_SIGNING_SECRET)
    if (!session) return unauthorized(request, env)

    try {
      if (request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT id, title, description, status, current_stage, checklist_json FROM tasks ORDER BY updated_at DESC',
        ).all<TaskRow>()

        const tasks = (results ?? []).map(rowToTask)
        return new Response(JSON.stringify({ tasks }), {
          headers: { ...baseHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (request.method === 'PUT') {
        const text = await request.text()
        let body: unknown
        try {
          body = JSON.parse(text)
        } catch {
          return badRequest('Invalid JSON', request, env)
        }
        if (!body || typeof body !== 'object' || !('tasks' in body)) {
          return badRequest('Expected { tasks: Task[] }', request, env)
        }
        const tasks = (body as { tasks: unknown }).tasks
        if (!Array.isArray(tasks)) {
          return badRequest('tasks must be an array', request, env)
        }

        const now = new Date().toISOString()
        const stmts: D1PreparedStatement[] = []

        stmts.push(env.DB.prepare('DELETE FROM tasks'))

        for (const raw of tasks) {
          if (!raw || typeof raw !== 'object') continue
          const t = raw as Record<string, unknown>
          const id = typeof t.id === 'string' ? t.id : ''
          const title = typeof t.title === 'string' ? t.title : ''
          const description = typeof t.description === 'string' ? t.description : ''
          const status = t.status === 'done' || t.status === 'active' ? t.status : null
          const cs = t.currentStage === 30 || t.currentStage === 60 || t.currentStage === 90 ? t.currentStage : null
          if (!id || !status || cs === null) continue
          const checklistJson = JSON.stringify(Array.isArray(t.checklist) ? t.checklist : [])

          stmts.push(
            env.DB
              .prepare(
                `INSERT INTO tasks (id, title, description, status, current_stage, checklist_json, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
              )
              .bind(id, title, description, status, cs, checklistJson, now),
          )
        }

        await env.DB.batch(stmts)

        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...baseHeaders, 'Content-Type': 'application/json' },
        })
      }

      return methodNotAllowed(request, env)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Server error'
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { ...baseHeaders, 'Content-Type': 'application/json' },
      })
    }
  },
}
