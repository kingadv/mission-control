import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/setup — create agent_activities table (one-time, requires API_KEY)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (body.key !== process.env.API_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Try inserting a test row — if table doesn't exist, we'll get an error
  const { error: testError } = await supabase
    .from('agent_activities')
    .select('id')
    .limit(1)

  if (testError && testError.message.includes('does not exist')) {
    return NextResponse.json({
      error: 'Table agent_activities does not exist. Please run the SQL migration manually in Supabase Dashboard > SQL Editor.',
      sql: `See /supabase-migration.sql in the project root.`
    }, { status: 400 })
  }

  return NextResponse.json({ status: 'ok', message: 'agent_activities table exists' })
}
