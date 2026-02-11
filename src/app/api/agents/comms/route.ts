import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key')
  if (key !== process.env.API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// POST /api/agents/comms — log inter-agent communication
export async function POST(req: NextRequest) {
  const auth = checkAuth(req)
  if (auth) return auth

  const body = await req.json()

  // Support single or batch
  const comms = Array.isArray(body) ? body : [body]
  const db = supabaseAdmin()

  const rows = comms.map(c => ({
    from_agent: c.from,
    to_agent: c.to,
    message: c.message,
    ...(c.createdAt ? { created_at: c.createdAt } : {}),
  }))

  const { data, error } = await db.from('agent_comms').insert(rows).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, count: rows.length })
}

// GET /api/agents/comms?limit=30
export async function GET(req: NextRequest) {
  const db = supabaseAdmin()
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '30')

  const { data, error } = await db
    .from('agent_comms')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const formatted = (data || []).map(c => ({
    id: c.id,
    from: c.from_agent,
    to: c.to_agent,
    message: c.message,
    createdAt: c.created_at,
  }))

  return NextResponse.json(formatted)
}
