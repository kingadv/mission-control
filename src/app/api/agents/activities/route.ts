import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Api-Key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// GET /api/agents/activities — fetch recent activities (public, paginated)
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const agent = url.searchParams.get('agent')
  const type = url.searchParams.get('type')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
  const offset = parseInt(url.searchParams.get('offset') || '0')

  const db = supabaseAdmin()
  let query = db
    .from('agent_activities')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (agent) query = query.eq('agent', agent)
  if (type) query = query.eq('activity_type', type)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS })
  }

  return NextResponse.json({ activities: data, count: data?.length || 0 }, { headers: CORS })
}

// POST /api/agents/activities — create activity (requires API key)
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '')
  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: CORS })
  }

  const body = await req.json()
  const { agent, activity_type, summary, detail, metadata } = body

  if (!agent || !activity_type || !summary) {
    return NextResponse.json(
      { error: 'agent, activity_type, and summary are required' },
      { status: 400, headers: CORS }
    )
  }

  const validTypes = ['deploy', 'research', 'bugfix', 'communication', 'edit', 'task_complete', 'task_start', 'git_commit', 'error', 'system']
  if (!validTypes.includes(activity_type)) {
    return NextResponse.json(
      { error: `Invalid activity_type. Must be one of: ${validTypes.join(', ')}` },
      { status: 400, headers: CORS }
    )
  }

  const db2 = supabaseAdmin()
  const { data, error } = await db2
    .from('agent_activities')
    .insert({
      agent,
      activity_type,
      summary,
      detail: detail || null,
      metadata: metadata || {},
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS })
  }

  return NextResponse.json({ activity: data }, { status: 201, headers: CORS })
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}
