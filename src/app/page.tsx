'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { AgentId, AgentSnapshot, AgentEvent } from '@/lib/types'
import { AgentCard } from '@/components/agent-card'
import { SummaryBar } from '@/components/summary-bar'
import { CommsFeed, AgentComm } from '@/components/comms-feed'
import { ActivityTimeline } from '@/components/activity-timeline'
import { LoginForm } from '@/components/login-form'
import { useAuth } from '@/components/auth-provider'
import Link from 'next/link'

interface StatusData {
  agents: Record<string, AgentSnapshot>
  summary: {
    totalTokens: number
    agentCount: number
    maxContextAgent: string | null
    maxContextPct: number
  }
  fetchedAt: string
}

interface DashboardData {
  events: AgentEvent[]
  comms: AgentComm[]
}

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [status, setStatus] = useState<StatusData | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch live agent status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/agents/status')
      if (res.ok) {
        const json = await res.json()
        setStatus(json)
      }
    } catch (e) {
      console.error('Status fetch failed:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch dashboard data (events, tasks, comms) — less frequent
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/agents')
      if (res.ok) {
        const json = await res.json()
        setDashboard({ events: json.events, comms: json.comms })
      }
    } catch (e) {
      console.error('Dashboard fetch failed:', e)
    }
  }, [])

  // Polling with visibility awareness
  useEffect(() => {
    fetchStatus()
    fetchDashboard()

    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        fetchStatus()
        // Fetch dashboard data every 2 minutes (less frequent)
        if (Date.now() % 120000 < 30000) fetchDashboard()
      }, 30000)
    }

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchStatus() // immediate refresh on tab focus
        startPolling()
      } else {
        stopPolling()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    startPolling()

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [fetchStatus, fetchDashboard])

  const handleKill = async (agent: AgentId, reason: string) => {
    try {
      const { supabaseBrowser } = await import('@/lib/supabase-browser')
      const { data: { session: s } } = await supabaseBrowser.auth.getSession()
      await fetch('/api/agents/kill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(s?.access_token ? { 'Authorization': `Bearer ${s.access_token}` } : {}),
        },
        body: JSON.stringify({ agent, reason }),
      })
      fetchStatus()
    } catch (e) {
      console.error('Kill failed:', e)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-500 text-sm">Carregando Mission Control...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-500 text-sm">Carregando dados...</p>
        </div>
      </div>
    )
  }

  const agentOrder: AgentId[] = ['noah', 'dora', 'kai', 'quinn']

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🛰️</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mission Control</h1>
            <p className="text-zinc-500 text-sm">Monitoramento do time de agentes</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-zinc-500">Live</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{user?.email}</span>
            <button
              onClick={signOut}
              className="text-xs text-zinc-500 hover:text-white bg-zinc-800 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <SummaryBar
          totalTokens={status?.summary.totalTokens || 0}
          agentCount={status?.summary.agentCount || 0}
          avgContext={0}
          maxContextAgent={status?.summary.maxContextAgent || null}
          maxContextPct={status?.summary.maxContextPct || 0}
          lastUpdated={status?.fetchedAt || null}
        />
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {agentOrder.map(agent => (
          <AgentCard
            key={agent}
            agent={agent}
            snapshot={status?.agents[agent] || null}
            onKill={handleKill}
          />
        ))}
      </div>

      {/* Timeline + Comms side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ActivityTimeline />
        <CommsFeed comms={dashboard?.comms || []} />
      </div>
    </main>
  )
}
