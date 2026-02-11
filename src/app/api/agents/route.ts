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

// POST /api/agents — receives snapshot data and stores it
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
      last_message_at: agent.lastMessageAt,
      last_channel: agent.lastChannel,
      current_task: agent.currentTask || null,
    })
  }

  return NextResponse.json({ ok: true, count: agents.length })
}

// GET /api/agents — latest snapshot + events + tasks
export async function GET(req: NextRequest) {
  const db = supabaseAdmin()

  // Get latest snapshot per agent
  const snapshots: Record<string, any> = {}
  for (const [agent] of Object.entries(AGENT_SESSION_MAP)) {
    const { data } = await db
      .from('agent_snapshots')
      .select('*')
      .eq('agent', agent)
      .order('snapshot_at', { ascending: false })
      .limit(1)
      .single()

    if (data) {
      const totalTokens = data.total_tokens || 0
      const contextTokens = data.context_tokens || 1000000
      const contextPercent = contextTokens > 0 ? (totalTokens / contextTokens) * 100 : 0

      snapshots[agent] = {
        agent: data.agent,
        sessionKey: data.session_key,
        status: data.status,
        model: data.model,
        totalTokens,
        contextTokens,
        contextPercent: Math.round(contextPercent * 10) / 10,
        lastMessageAt: data.last_message_at,
        lastChannel: data.last_channel,
        currentTask: data.current_task,
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

  // Get tasks (from agent_events with type task_*)
  const { data: taskEvents } = await db
    .from('agent_events')
    .select('*')
    .in('event_type', ['task_start', 'task_complete', 'task_error', 'snapshot'])
    .order('created_at', { ascending: false })
    .limit(30)

  const tasks = (taskEvents || []).map(e => ({
    id: e.id,
    agent: e.agent,
    summary: e.summary || 'Task sem descrição',
    status: e.event_type === 'task_start' ? 'running' : e.event_type === 'task_error' ? 'error' : 'completed',
    startedAt: e.created_at,
    completedAt: e.event_type !== 'task_start' ? e.created_at : null,
    tokensUsed: e.tokens_used || 0,
  }))

  // Get comms
  const { data: commsData } = await db
    .from('agent_comms')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)

  const comms = (commsData || []).map(c => ({
    id: c.id,
    from: c.from_agent,
    to: c.to_agent,
    message: c.message,
    createdAt: c.created_at,
  }))

  // Summary with context stats
  const agentEntries = Object.values(snapshots)
  const contextPcts = agentEntries.map((s: any) => ({ agent: s.agent, pct: s.contextPercent }))
  const maxCtx = contextPcts.reduce((max, c) => c.pct > max.pct ? c : max, { agent: null, pct: 0 })

  return NextResponse.json({
    agents: snapshots,
    events: formattedEvents,
    tasks,
    comms,
    summary: {
      totalTokens: agentEntries.reduce((a: number, s: any) => a + (s.totalTokens || 0), 0),
      agentCount: agentEntries.length,
      avgContext: agentEntries.length > 0
        ? Math.round(contextPcts.reduce((a, c) => a + c.pct, 0) / contextPcts.length * 10) / 10
        : 0,
      maxContextAgent: maxCtx.agent,
      maxContextPct: maxCtx.pct,
    },
  })
}
