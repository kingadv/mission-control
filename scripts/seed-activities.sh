#!/bin/bash
# Seed initial activities into the timeline
# Run after the agent_activities table exists

API="https://board.scosta.io/api/agents/activities"
KEY="agent-tasks-2026"

post() {
  curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "X-Api-Key: $KEY" \
    -d "$1"
  echo ""
}

# Kai activities
post '{"agent":"kai","activity_type":"deploy","summary":"Deploy retro-football v2 para Vercel","detail":"Team selection, sprite colors, flags, result screen + Claude Code quality pass (9 bug fixes)","metadata":{"url":"https://retro-football.vercel.app"}}'
post '{"agent":"kai","activity_type":"bugfix","summary":"Claude Code quality pass: 9 bugs corrigidos no retro-football","detail":"2nd half fix, goal credit fix, AI direction fix, flag art improvements, UI centering, title screen redesign, dynamic celebration colors","metadata":{"tool":"claude-code","bugs_fixed":9}}'
post '{"agent":"kai","activity_type":"deploy","summary":"Deploy Mission Control dashboard para board.scosta.io","detail":"Agent cards, summary bar, comms feed com chat bubbles estilo Telegram","metadata":{"url":"https://board.scosta.io"}}'
post '{"agent":"kai","activity_type":"edit","summary":"Comms feed: chat bubbles estilo Telegram com markdown","detail":"react-markdown + prose-invert, bubbles coloridas por agente, expand/collapse, smooth scroll","metadata":{}}'
post '{"agent":"kai","activity_type":"git_commit","summary":"remove: timeline, tasks panel, activity feed sections","detail":"Dashboard cleanup - removed empty sections","metadata":{"commit":"91e5cb1"}}'

# Noah activities
post '{"agent":"noah","activity_type":"task_start","summary":"Delegou construção do Mission Control para Kai","detail":"Dashboard de monitoramento dos 3 agentes em board.scosta.io","metadata":{}}'
post '{"agent":"noah","activity_type":"communication","summary":"Coordenação com Kai sobre features do dashboard","detail":"Context usage bars, kill switch, comms feed design","metadata":{}}'
post '{"agent":"noah","activity_type":"system","summary":"Heartbeat check: todos os agentes online","detail":"Noah, Kai, Dora - status OK","metadata":{}}'

# Dora activities
post '{"agent":"dora","activity_type":"research","summary":"Pesquisa sobre frameworks de dashboard para agentes AI","detail":"Comparou Langfuse, Phoenix, custom Supabase. Recomendação: custom build com Supabase (3 agentes não justifica infra pesada)","metadata":{}}'
post '{"agent":"dora","activity_type":"research","summary":"Pesquisa sobre paleta de cores e design para Mission Control","detail":"Dark mode, zinc-900, gradientes sutis, cards com glow por status","metadata":{}}'

echo "Done seeding activities!"
