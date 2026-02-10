# 🛰️ Mission Control

AI Agent Monitoring Dashboard — real-time monitoring for OpenClaw agent teams.

## Features

- **Agent Status** — Online/Working/Idle/Offline for each agent
- **Token & Cost Tracking** — Per-agent and total usage
- **Activity Feed** — Real-time event log with tool calls, messages, errors
- **Summary Dashboard** — Aggregated stats at a glance

## Stack

- Next.js 14 (App Router)
- Supabase (PostgreSQL)
- Tailwind CSS v4
- Vercel

## API

All endpoints require `x-api-key` header.

```
GET  /api/agents          — Latest snapshots + events + summary
POST /api/agents          — Push agent snapshots
GET  /api/agents/events   — Query events (?agent=kai&limit=20)
POST /api/agents/events   — Log an event
```

## Deploy

```bash
npm install
npm run build
vercel --prod
```

## Agents

| Agent | Role | Session Key |
|-------|------|-------------|
| Noah 🧠 | Orchestrator | agent:main:main |
| Dora 🔍 | Researcher | agent:researcher:main |
| Kai ⚡ | Engineer | agent:kai:main |
