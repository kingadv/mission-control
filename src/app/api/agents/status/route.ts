import { NextResponse } from 'next/server'

const OPENCLAW_API_URL = 'https://api.scosta.io/sessions'

const AGENT_MAP: Record<string, string> = {
  'agent:main:main': 'noah',
  'agent:kai:main': 'kai',
  'agent:researcher:main': 'dora',
}

// GET /api/agents/status — proxy to OpenClaw sessions API (token never exposed to client)
export async function GET() {
  const token = process.env.OPENCLAW_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'OPENCLAW_API_TOKEN not configured' }, { status: 500 })
  }

  try {
    const res = await fetch(OPENCLAW_API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Source': 'board-mission-control',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream ${res.status}` }, { status: 502 })
    }

    const data = await res.json()
    const sessions = data.sessions || []

    const now = Date.now()
    const tenMinAgo = now - 10 * 60 * 1000

    const agents: Record<string, any> = {}

    for (const session of sessions) {
      const agent = AGENT_MAP[session.key]
      if (!agent) continue

      const totalTokens = session.totalTokens || 0
      const contextTokens = session.contextTokens || 1000000
      const contextPercent = contextTokens > 0 ? Math.round((totalTokens / contextTokens) * 1000) / 10 : 0
      const isRecent = session.updatedAt > tenMinAgo

      agents[agent] = {
        agent,
        sessionKey: session.key,
        status: isRecent ? 'working' : 'idle',
        model: session.model || null,
        totalTokens,
        contextTokens,
        contextPercent,
        inputTokens: session.inputTokens || 0,
        outputTokens: session.outputTokens || 0,
        lastMessageAt: session.updatedAt ? new Date(session.updatedAt).toISOString() : null,
        updatedAt: session.updatedAt,
      }
    }

    // Summary
    const entries = Object.values(agents)
    const contextPcts = entries.map((a: any) => ({ agent: a.agent, pct: a.contextPercent }))
    const maxCtx = contextPcts.reduce((max, c) => c.pct > max.pct ? c : max, { agent: null as string | null, pct: 0 })

    return NextResponse.json({
      agents,
      summary: {
        totalTokens: entries.reduce((sum: number, a: any) => sum + a.totalTokens, 0),
        agentCount: entries.length,
        maxContextAgent: maxCtx.agent,
        maxContextPct: maxCtx.pct,
      },
      fetchedAt: new Date().toISOString(),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch' }, { status: 502 })
  }
}
