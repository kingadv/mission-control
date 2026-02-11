import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key')
  if (key !== process.env.API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

const OPENCLAW_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:3100'
const OPENCLAW_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || ''

const AGENT_MAP: Record<string, string> = {
  'agent:main:main': 'noah',
  'agent:kai:main': 'kai',
  'agent:researcher:main': 'dora',
}

// POST /api/agents/collect — self-contained collection from OpenClaw APIs
// Called by cron or manually. Fetches sessions_list and stores snapshots.
export async function POST(req: NextRequest) {
  const auth = checkAuth(req)
  if (auth) return auth

  // This endpoint receives pre-collected data from the cron agent
  // since we can't call OpenClaw APIs from Vercel
  const body = await req.json()
  const { sessions } = body
  
  if (!sessions || !Array.isArray(sessions)) {
    return NextResponse.json({ error: 'sessions array required' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const now = new Date()
  const tenMinAgo = now.getTime() - 10 * 60 * 1000
  const results = []

  for (const session of sessions) {
    const agent = AGENT_MAP[session.key]
    if (!agent) continue

    const updatedAt = session.updatedAt // epoch ms
    const isRecent = updatedAt > tenMinAgo
    const status = isRecent ? (session.abortedLastRun === false ? 'working' : 'online') : 'idle'
    const lastMessageAt = updatedAt ? new Date(updatedAt).toISOString() : null

    const snapshot = {
      agent,
      session_key: session.key,
      status,
      model: session.model || null,
      total_tokens: session.totalTokens || 0,
      context_tokens: session.contextTokens || 0,
      cost_total: session.cost || 0,
      last_message_at: lastMessageAt,
      last_channel: session.lastChannel || null,
    }

    const { error } = await db.from('agent_snapshots').insert(snapshot)
    if (!error) results.push({ agent, status })
  }

  return NextResponse.json({ ok: true, collected: results })
}
