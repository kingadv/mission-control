# 🛰️ Mission Control

Real-time AI Agent Monitoring Dashboard for OpenClaw agent teams.

**Live:** [board.scosta.io](https://board.scosta.io)

## Features

### Dashboard
- **Agent Status Cards** — Online/Working/Idle/Offline with live indicators
- **Context Usage** — Progress bar showing % of 1M token context limit per agent
- **Context Alerts** — Auto-logged when agent hits 80%+ context usage
- **"Doing Now"** — Shows what each agent is currently working on
- **Kill Switch** — Emergency stop button on active agents (with confirmation + reason)

### Communication
- **Agent Comms Feed** — Chat log showing inter-agent messages (Noah→Kai, Kai→Noah, etc.)

### Activity
- **Session Timeline** — Visual event history grouped by date
- **Tasks Panel** — Running/completed/error tasks per agent
- **Activity Feed** — Real-time event log (tool calls, messages, errors, spawns)

### Infrastructure
- **Auto-refresh** — Dashboard polls every 30 seconds
- **Cron Snapshots** — Agent data collected every 5 minutes via OpenClaw cron (Haiku)
- **Login** — Supabase Auth (email/password) required to access dashboard
- **Summary Bar** — Aggregated stats: total tokens, highest context agent, last update time

## Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL), Vercel Serverless
- **Auth:** Supabase Auth
- **Data Collection:** OpenClaw Cron Jobs (Haiku model)
- **DNS:** Cloudflare

## API

### Public (consumed by dashboard)
```
GET  /api/agents              — Latest snapshots + events + tasks + comms + summary
GET  /api/agents/comms        — Agent communications (?limit=30)
```

### Protected (x-api-key header required)
```
POST /api/agents              — Push agent snapshots
POST /api/agents/collect      — Push raw session data (used by cron)
POST /api/agents/events       — Log an event
GET  /api/agents/events       — Query events (?agent=kai&limit=20)
POST /api/agents/comms        — Log inter-agent communication
POST /api/agents/kill         — Request agent stop (Supabase Auth or API key)
```

## Agents

| Agent | Role | Session Key | Emoji |
|-------|------|-------------|-------|
| Noah | Orchestrator | agent:main:main | 🧠 |
| Dora | Researcher | agent:dora:main | 🔍 |
| Kai | Engineer | agent:kai:main | ⚡ |
| Quinn | QA | agent:qa:main | 🧪 |

## Database Tables

- `agent_snapshots` — Periodic agent state (status, tokens, context, model, current task)
- `agent_events` — Activity log (tool calls, errors, alerts, kills, snapshots)
- `agent_comms` — Inter-agent message history

## QA Visual

Playwright-powered visual testing suite for smoke tests across desktop and mobile viewports.

### Setup
```bash
npm install -D @playwright/test
npx playwright install chromium --with-deps
```

### Tests
- **Home Page Loading** — Verifies mission control loads correctly
- **Desktop Sidebar** — Checks sidebar visibility and navigation on desktop
- **Mobile Navigation** — Tests hamburger menu and mobile interactions
- **Page Navigation** — Tests routing between Home and Second Brain
- **Console Error Detection** — Monitors for JavaScript errors

### Running Tests
```bash
npm run test:visual              # Headless testing
npm run test:visual:headed       # Browser UI testing
```

### Configuration
- **Desktop:** 1280x720 viewport
- **Mobile:** 390x844 viewport (Pixel 5-like)
- **Screenshots:** Saved to `screenshots/` for visual baselines
- **Test Results:** Generated in `test-results/`

## Deploy

```bash
npm install
npm run build
vercel --prod
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
API_KEY=
```
