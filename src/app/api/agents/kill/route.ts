import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

async function checkAuth(req: NextRequest) {
  // API key auth
  const key = req.headers.get('x-api-key')
  if (key === process.env.API_KEY) return null

  // Supabase session auth (from browser)
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser(token)
    if (user) return null
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// POST /api/agents/kill — request to pause/stop an agent
export async function POST(req: NextRequest) {
  const auth = await checkAuth(req)
  if (auth) return auth

  const { agent, reason } = await req.json()

  if (!agent) {
    return NextResponse.json({ error: 'agent required' }, { status: 400 })
  }

  const db = supabaseAdmin()

  await db.from('agent_events').insert({
    agent,
    event_type: 'kill_request',
    summary: `🛑 Kill switch acionado: ${reason || 'sem motivo especificado'}`,
    metadata: { reason, requestedAt: new Date().toISOString() },
  })

  return NextResponse.json({
    ok: true,
    message: `Kill request logged for ${agent}. Will be processed on next cron cycle.`,
  })
}
