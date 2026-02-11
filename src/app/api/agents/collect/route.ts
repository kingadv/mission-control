import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key')
  if (key !== process.env.API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

const AGENT_MAP: Record<string, string> = {
  'agent:main:main': 'noah',
  'agent:kai:main': 'kai',
  'agent:researcher:main': 'dora',
}

// POST /api/agents/collect — receives raw session data from cron
export async function POST(req: NextRequest) {
  const auth = checkAuth(req)
  if (auth) return auth

  const body = await req.json()
  const { sessions } = body

  if (!sessions || !Array.isArray(sessions)) {
    return NextResponse.json({ error: 'sessions array required' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const now = Date.now()
  const tenMinAgo = now - 10 * 60 * 1000
  const results = []
  const alerts = []

  for (const session of sessions) {
    const agent = AGENT_MAP[session.key]
    if (!agent) continue

    const updatedAt = session.updatedAt
    const isRecent = updatedAt > tenMinAgo
    const status = isRecent ? (session.abortedLastRun === false ? 'working' : 'online') : 'idle'
    const lastMessageAt = updatedAt ? new Date(updatedAt).toISOString() : null
    const totalTokens = session.totalTokens || 0
    const contextTokens = session.contextTokens || 1000000
    const contextPercent = contextTokens > 0 ? (totalTokens / contextTokens) * 100 : 0

    const snapshot = {
      agent,
      session_key: session.key,
      status,
      model: session.model || null,
      total_tokens: totalTokens,
      context_tokens: contextTokens,
      last_message_at: lastMessageAt,
      last_channel: session.lastChannel || null,
      current_task: session.currentTask || null,
    }

    const { error } = await db.from('agent_snapshots').insert(snapshot)
    if (!error) results.push({ agent, status, contextPercent: Math.round(contextPercent * 10) / 10 })

    // Context alert at 80%
    if (contextPercent >= 80) {
      alerts.push({ agent, contextPercent: Math.round(contextPercent * 10) / 10 })
      await db.from('agent_events').insert({
        agent,
        event_type: 'context_alert',
        summary: `⚠️ ${agent} chegou a ${Math.round(contextPercent)}% do contexto (${totalTokens}/${contextTokens} tokens)`,
        tokens_used: totalTokens,
      })
    }
  }

  return NextResponse.json({ ok: true, collected: results, alerts })
}
