import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/migrate — create tables using service role (one-time setup)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (body.key !== process.env.API_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Check if table already exists by trying a query
  const { error: checkError } = await supabase
    .from('agent_activities')
    .select('id')
    .limit(1)

  if (!checkError) {
    return NextResponse.json({ status: 'ok', message: 'Table already exists' })
  }

  // Table doesn't exist — try creating it via SQL through PostgREST RPC
  // We need to use the postgres connection or an SQL exec function
  // Supabase JS client doesn't support raw DDL, so we'll use the REST SQL endpoint
  
  const pgUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace('.supabase.co', '.supabase.co')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Try the SQL endpoint (available in newer Supabase versions)
  const sqlQuery = `
    CREATE TABLE IF NOT EXISTS agent_activities (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      agent text NOT NULL,
      activity_type text NOT NULL,
      summary text NOT NULL,
      detail text,
      metadata jsonb DEFAULT '{}',
      created_at timestamptz DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_activities_created_at ON agent_activities (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_activities_agent ON agent_activities (agent);
    CREATE INDEX IF NOT EXISTS idx_activities_type ON agent_activities (activity_type);
    ALTER TABLE agent_activities ENABLE ROW LEVEL SECURITY;
    CREATE POLICY IF NOT EXISTS "anon_read_activities" ON agent_activities FOR SELECT USING (true);
    CREATE POLICY IF NOT EXISTS "service_insert_activities" ON agent_activities FOR INSERT WITH CHECK (true);
  `

  // Use Supabase's pg_net or direct SQL execution
  // Since we can't run raw SQL via PostgREST, let's try the Management API
  const projRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.match(/https:\/\/([^.]+)/)?.[1]
  
  try {
    // Try via the new SQL API endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: sqlQuery }),
    })

    if (res.ok) {
      return NextResponse.json({ status: 'ok', message: 'Table created via exec_sql RPC' })
    }

    // If exec_sql doesn't exist, provide the SQL for manual execution
    return NextResponse.json({
      status: 'manual_required',
      message: 'Cannot auto-create table. Please run the SQL below in Supabase Dashboard > SQL Editor.',
      sql: sqlQuery,
      project_ref: projRef,
      dashboard_url: `https://supabase.com/dashboard/project/${projRef}/sql`,
    })
  } catch (e: any) {
    return NextResponse.json({ 
      error: e.message, 
      message: 'Run SQL manually in Supabase Dashboard',
      sql: sqlQuery 
    }, { status: 500 })
  }
}
