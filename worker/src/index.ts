export interface Env {
  DB: D1Database
  API_SECRET: string
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
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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

function verifyBearer(request: Request, secret: string): boolean {
  const h = request.headers.get('Authorization') ?? ''
  const m = /^Bearer\s+(.+)$/i.exec(h)
  return Boolean(m && m[1] === secret)
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
    if (url.pathname !== '/tasks' && url.pathname !== '/tasks/') {
      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { ...baseHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!env.API_SECRET) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: { ...baseHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!verifyBearer(request, env.API_SECRET)) {
      return unauthorized(request, env)
    }

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

      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...baseHeaders, 'Content-Type': 'application/json' },
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Server error'
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { ...baseHeaders, 'Content-Type': 'application/json' },
      })
    }
  },
}
