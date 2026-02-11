'use client'

import { useEffect, useState, useCallback } from 'react'
import { AgentId, AgentSnapshot, AgentEvent, AgentTask } from '@/lib/types'
import { AgentCard } from '@/components/agent-card'
import { ActivityFeed } from '@/components/activity-feed'
import { SummaryBar } from '@/components/summary-bar'
import { TasksPanel } from '@/components/tasks-panel'
import { LoginForm } from '@/components/login-form'
import { useAuth } from '@/components/auth-provider'

interface DashboardData {
  agents: Record<string, AgentSnapshot>
  events: AgentEvent[]
  tasks: AgentTask[]
  summary: {
    totalTokens: number
    agentCount: number
    avgContext: number
    maxContextAgent: string | null
    maxContextPct: number
  }
}

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastSnapshot, setLastSnapshot] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/agents')
      if (res.ok) {
        const json = await res.json()
        setData(json)
        const snapshotTimes = Object.values(json.agents || {})
          .map((a: any) => a.snapshotAt)
          .filter(Boolean)
          .sort()
          .reverse()
        setLastSnapshot(snapshotTimes[0] || null)
      }
    } catch (e) {
      console.error('Failed to fetch:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (authLoading || (!user && loading)) {
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

  const agentOrder: AgentId[] = ['noah', 'dora', 'kai']

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
          totalTokens={data?.summary.totalTokens || 0}
          agentCount={data?.summary.agentCount || 0}
          avgContext={data?.summary.avgContext || 0}
          maxContextAgent={data?.summary.maxContextAgent || null}
          maxContextPct={data?.summary.maxContextPct || 0}
          lastUpdated={lastSnapshot}
        />
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {agentOrder.map(agent => (
          <AgentCard
            key={agent}
            agent={agent}
            snapshot={data?.agents[agent] || null}
          />
        ))}
      </div>

      {/* Tasks + Activity Feed side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksPanel tasks={data?.tasks || []} />
        <ActivityFeed events={data?.events || []} />
      </div>
    </main>
  )
}
