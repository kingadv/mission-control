'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AgentId, AGENTS } from '@/lib/types'

export interface Activity {
  id: string
  agent: AgentId
  activity_type: string
  summary: string
  detail: string | null
  metadata: Record<string, unknown>
  created_at: string
}

const TYPE_ICONS: Record<string, string> = {
  deploy: '🚀',
  research: '🔍',
  bugfix: '🐛',
  communication: '💬',
  edit: '📝',
  task_complete: '✅',
  task_start: '🏁',
  git_commit: '📦',
  error: '❌',
  system: '⚙️',
}

const TYPE_LABELS: Record<string, string> = {
  deploy: 'Deploy',
  research: 'Pesquisa',
  bugfix: 'Bugfix',
  communication: 'Comunicação',
  edit: 'Edição',
  task_complete: 'Tarefa Concluída',
  task_start: 'Tarefa Iniciada',
  git_commit: 'Git Commit',
  error: 'Erro',
  system: 'Sistema',
}

function timeAgo(date: string): string {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  return `${Math.floor(hours / 24)}d atrás`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function groupByDate(activities: Activity[]): Map<string, Activity[]> {
  const groups = new Map<string, Activity[]>()
  for (const a of activities) {
    const key = new Date(a.created_at).toISOString().split('T')[0]
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(a)
  }
  return groups
}

export function ActivityTimeline() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [initialLoad, setInitialLoad] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [filterAgent, setFilterAgent] = useState<AgentId | 'all'>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [newIds, setNewIds] = useState<Set<string>>(new Set())
  const seenIdsRef = useRef<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  // Build query params
  const buildParams = useCallback((offset = 0, limit = 30) => {
    const p = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    if (filterAgent !== 'all') p.set('agent', filterAgent)
    if (filterType !== 'all') p.set('type', filterType)
    return p
  }, [filterAgent, filterType])

  // Initial load + filter change
  const fetchAll = useCallback(async () => {
    setInitialLoad(true)
    try {
      const res = await fetch(`/api/agents/activities?${buildParams()}`)
      if (!res.ok) return
      const { activities: data } = await res.json()
      const items: Activity[] = data || []
      setActivities(items)
      setHasMore(items.length >= 30)
      seenIdsRef.current = new Set(items.map((a: Activity) => a.id))
      setNewIds(new Set())
    } catch (e) {
      console.error('fetch activities:', e)
    } finally {
      setInitialLoad(false)
    }
  }, [buildParams])

  // Silent poll — merge new items on top, no flash
  const pollNew = useCallback(async () => {
    try {
      const res = await fetch(`/api/agents/activities?${buildParams(0, 15)}`)
      if (!res.ok) return
      const { activities: latest } = await res.json()
      if (!latest?.length) return

      setActivities(prev => {
        const existingIds = new Set(prev.map(a => a.id))
        const fresh = (latest as Activity[]).filter(a => !existingIds.has(a.id))
        if (fresh.length === 0) return prev

        // Track new IDs for animation
        const freshIds = new Set(fresh.map(a => a.id))
        setNewIds(freshIds)
        // Clear animation after 2s
        setTimeout(() => setNewIds(s => {
          const next = new Set(s)
          freshIds.forEach(id => next.delete(id))
          return next
        }), 2000)

        // Add to seenIds
        fresh.forEach(a => seenIdsRef.current.add(a.id))

        return [...fresh, ...prev]
      })
    } catch {}
  }, [buildParams])

  // Initial fetch on mount / filter change
  useEffect(() => { fetchAll() }, [fetchAll])

  // Poll every 30s (silent)
  useEffect(() => {
    const iv = setInterval(pollNew, 30000)
    return () => clearInterval(iv)
  }, [pollNew])

  // Load more (append at bottom)
  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/agents/activities?${buildParams(activities.length)}`)
      if (!res.ok) return
      const { activities: more } = await res.json()
      const items: Activity[] = more || []
      setActivities(prev => [...prev, ...items])
      setHasMore(items.length >= 30)
      items.forEach((a: Activity) => seenIdsRef.current.add(a.id))
    } catch {} finally {
      setLoadingMore(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const grouped = groupByDate(activities)

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur">
      {/* Header + Filters */}
      <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h2 className="text-lg font-semibold text-zinc-100">Timeline de Atividades</h2>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <select
            value={filterAgent}
            onChange={e => setFilterAgent(e.target.value as AgentId | 'all')}
            className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          >
            {(['all', 'noah', 'dora', 'kai', 'quinn'] as const).map(id => (
              <option key={id} value={id}>
                {id === 'all' ? '👥 Todos' : `${AGENTS[id].emoji} ${AGENTS[id].name}`}
              </option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          >
            {['all', ...Object.keys(TYPE_ICONS)].map(t => (
              <option key={t} value={t}>
                {t === 'all' ? '📊 Todos os tipos' : `${TYPE_ICONS[t]} ${TYPE_LABELS[t]}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div ref={containerRef} className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
        {initialLoad ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-500 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">Carregando atividades...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-zinc-500 text-sm">Nenhuma atividade encontrada</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[27px] top-0 bottom-0 w-px bg-zinc-800" />

            {Array.from(grouped.entries()).map(([dateKey, dayActivities]) => (
              <div key={dateKey}>
                <div className="sticky top-0 z-10 bg-zinc-900/90 backdrop-blur-sm px-4 py-2 border-b border-zinc-800/50">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    {formatDate(dayActivities[0].created_at)}
                  </span>
                </div>

                {dayActivities.map((activity) => {
                  const agent = AGENTS[activity.agent]
                  const isNew = newIds.has(activity.id)

                  return (
                    <div
                      key={activity.id}
                      className={`relative flex gap-3 px-4 py-3 hover:bg-zinc-800/30 transition-all duration-500 group ${
                        isNew ? 'bg-zinc-800/40 animate-fade-in' : ''
                      }`}
                    >
                      <div className="relative z-10 flex-shrink-0 w-[22px] h-[22px] rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-[10px] mt-0.5">
                        {TYPE_ICONS[activity.activity_type] || '•'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-0.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${agent?.color || 'text-zinc-400'}`}>
                            <span>{agent?.emoji}</span>
                            <span>{agent?.name || activity.agent}</span>
                          </span>
                          <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-full">
                            {TYPE_LABELS[activity.activity_type] || activity.activity_type}
                          </span>
                          <span className="text-[10px] text-zinc-600 ml-auto flex-shrink-0" title={new Date(activity.created_at).toLocaleString('pt-BR')}>
                            {formatTime(activity.created_at)} · {timeAgo(activity.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">{activity.summary}</p>
                        {activity.detail && (
                          <div className="mt-1.5">
                            <button
                              onClick={() => toggleExpand(activity.id)}
                              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                              {expanded.has(activity.id) ? '▾ Menos detalhes' : '▸ Mais detalhes'}
                            </button>
                            {expanded.has(activity.id) && (
                              <div className="mt-1.5 text-xs text-zinc-500 bg-zinc-800/50 rounded-lg p-3 border border-zinc-800 whitespace-pre-wrap font-mono leading-relaxed">
                                {activity.detail}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}

            {hasMore && (
              <div className="p-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-800 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Carregando...' : 'Carregar mais'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
