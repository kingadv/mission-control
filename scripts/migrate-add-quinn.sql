-- Add Quinn support to existing agent_activities constraint
-- Run once in Supabase SQL Editor

ALTER TABLE agent_activities DROP CONSTRAINT IF EXISTS agent_activities_agent_check;

ALTER TABLE agent_activities
  ADD CONSTRAINT agent_activities_agent_check
  CHECK (agent IN ('noah', 'kai', 'dora', 'quinn'));
