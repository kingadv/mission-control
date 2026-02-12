-- Migration: Create agent_activities table
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

CREATE TABLE IF NOT EXISTS agent_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent text NOT NULL CHECK (agent IN ('noah', 'kai', 'dora')),
  activity_type text NOT NULL CHECK (activity_type IN ('deploy', 'research', 'bugfix', 'communication', 'edit', 'task_complete', 'task_start', 'git_commit', 'error', 'system')),
  summary text NOT NULL,
  detail text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Index for fast timeline queries
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON agent_activities (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_agent ON agent_activities (agent);
CREATE INDEX IF NOT EXISTS idx_activities_type ON agent_activities (activity_type);

-- Enable RLS
ALTER TABLE agent_activities ENABLE ROW LEVEL SECURITY;

-- Read policy for authenticated users
CREATE POLICY "Authenticated users can read activities" ON agent_activities
  FOR SELECT USING (auth.role() = 'authenticated');

-- Service role can insert
CREATE POLICY "Service role can insert activities" ON agent_activities
  FOR INSERT WITH CHECK (true);

-- Also allow anon read (for public dashboard GET)
CREATE POLICY "Anon can read activities" ON agent_activities
  FOR SELECT USING (true);
