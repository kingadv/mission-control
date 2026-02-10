import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const AGENT_SESSION_MAP: Record<string, string> = {
  noah: 'agent:main:main',
  kai: 'agent:kai:main',
  dora: 'agent:researcher:main',
}

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key')
  if (key !== process.env.API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// POST /api/agents — receives snapshot data from OpenClaw cron and stores it
export async function POST(req: NextRequest) {
  const auth = checkAuth(req)
  if (auth) return auth

  const { agents } = await req.json()
  const db = supabaseAdmin()

  for (const agent of agents) {
    await db.from('agent_snapshots').insert({
      agent: agent.agent,
      session_key: agent.sessionKey,
      status: agent.status,
      model: agent.model,
      total_tokens: agent.totalTokens,
      context_tokens: agent.contextTokens,
      cost_total: agent.costTotal,
      last_message_at: agent.lastMessageAt,
      last_channel: agent.lastChannel,
    })
  }

  return NextResponse.json({ ok: true, count: agents.length })
}

// GET /api/agents — returns latest snapshot for each agent + recent events
export async function GET(req: NextRequest) {
  const db = supabaseAdmin()

  // Get latest snapshot per agent
  const snapshots: Record<string, any> = {}
  for (const [agent, sessionKey] of Object.entries(AGENT_SESSION_MAP)) {
    const { data } = await db
      .from('agent_snapshots')
      .select('*')
      .eq('agent', agent)
      .order('snapshot_at', { ascending: false })
      .limit(1)
      .single()
    
    if (data) {
      snapshots[agent] = {
        agent: data.agent,
        sessionKey: data.session_key,
        status: data.status,
        model: data.model,
        totalTokens: data.total_tokens,
        contextTokens: data.context_tokens,
        costTotal: parseFloat(data.cost_total),
        lastMessageAt: data.last_message_at,
        lastChannel: data.last_channel,
        snapshotAt: data.snapshot_at,
      }
    }
  }

  // Get recent events
  const { data: events } = await db
    .from('agent_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const formattedEvents = (events || []).map(e => ({
    id: e.id,
    agent: e.agent,
    eventType: e.event_type,
    summary: e.summary,
    tokensUsed: e.tokens_used,
    cost: parseFloat(e.cost),
    metadata: e.metadata,
    createdAt: e.created_at,
  }))

  // Aggregate stats
  const { data: totalCosts } = await db
    .from('agent_snapshots')
    .select('agent, cost_total')
    .order('snapshot_at', { ascending: false })

  // Get per-agent latest cost
  const costByAgent: Record<string, number> = {}
  for (const row of (totalCosts || [])) {
    if (!costByAgent[row.agent]) {
      costByAgent[row.agent] = parseFloat(row.cost_total)
    }
  }

  return NextResponse.json({
    agents: snapshots,
    events: formattedEvents,
    summary: {
      totalCost: Object.values(costByAgent).reduce((a, b) => a + b, 0),
      totalTokens: Object.values(snapshots).reduce((a: number, s: any) => a + (s.totalTokens || 0), 0),
      agentCount: Object.keys(snapshots).length,
    },
  })
}
