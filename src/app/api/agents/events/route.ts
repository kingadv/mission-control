import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key')
  if (key !== process.env.API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// POST /api/agents/events — log an agent event
export async function POST(req: NextRequest) {
  const auth = checkAuth(req)
  if (auth) return auth

  const body = await req.json()
  const db = supabaseAdmin()

  const { data, error } = await db.from('agent_events').insert({
    agent: body.agent,
    event_type: body.eventType,
    summary: body.summary,
    tokens_used: body.tokensUsed || 0,
    cost: body.cost || 0,
    metadata: body.metadata || {},
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}

// GET /api/agents/events?agent=kai&limit=20
export async function GET(req: NextRequest) {
  const db = supabaseAdmin()
  const { searchParams } = new URL(req.url)

  let query = db.from('agent_events').select('*').order('created_at', { ascending: false })

  const agent = searchParams.get('agent')
  if (agent) query = query.eq('agent', agent)

  const limit = parseInt(searchParams.get('limit') || '50')
  query = query.limit(limit)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
