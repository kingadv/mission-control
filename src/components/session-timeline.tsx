'use client'

import { AGENTS, AgentId } from '@/lib/types'
import { formatTokens, timeAgo } from '@/lib/format'

export interface TimelineEntry {
  id: string
  agent: string
  eventType: string
  summary: string | null
  tokensUsed: number
  createdAt: string
}

interface SessionTimelineProps {
  entries: TimelineEntry[]
}

function entryColor(type: string): string {
  switch (type) {
    case 'task_start':
    case 'spawn': return 'border-blue-500'
    case 'task_complete':
    case 'snapshot': return 'border-green-500'
    case 'task_error':
    case 'error': return 'border-red-500'
    case 'context_alert': return 'border-amber-500'
    case 'message': return 'border-purple-500'
    case 'tool_call': return 'border-cyan-500'
    default: return 'border-zinc-600'
  }
}

function entryIcon(type: string): string {
  switch (type) {
    case 'task_start':
    case 'spawn': return '🚀'
    case 'task_complete':
    case 'snapshot': return '✅'
    case 'task_error':
    case 'error': return '❌'
    case 'context_alert': return '⚠️'
    case 'message': return '💬'
    case 'tool_call': return '🔧'
    default: return '📋'
  }
}

export function SessionTimeline({ entries }: SessionTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📅</span>
          <h2 className="text-lg font-semibold">Timeline</h2>
        </div>
        <p className="text-zinc-500 text-sm text-center py-8">Nenhum evento na timeline</p>
      </div>
    )
  }

  // Group by date
  const grouped: Record<string, TimelineEntry[]> = {}
  for (const entry of entries) {
    const date = new Date(entry.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(entry)
  }

  return (
    <div className="rounded-xl border border-zinc-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📅</span>
        <h2 className="text-lg font-semibold">Timeline</h2>
      </div>
      <div className="max-h-[500px] overflow-y-auto pr-2">
        {Object.entries(grouped).map(([date, dayEntries]) => (
          <div key={date} className="mb-4">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 sticky top-0 bg-zinc-900 py-1">{date}</p>
            <div className="space-y-0">
              {dayEntries.map((entry, i) => {
                const agent = AGENTS[entry.agent as AgentId]
                return (
                  <div key={entry.id} className="flex gap-3">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 ${entryColor(entry.eventType)} bg-zinc-900 shrink-0 mt-1.5`} />
                      {i < dayEntries.length - 1 && <div className="w-px flex-1 bg-zinc-800 min-h-[20px]" />}
                    </div>
                    {/* Content */}
                    <div className="pb-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{entryIcon(entry.eventType)}</span>
                        <span className={`text-xs font-medium ${agent?.color || 'text-zinc-400'}`}>{agent?.name || entry.agent}</span>
                        <span className="text-[10px] text-zinc-600 font-mono">
                          {new Date(entry.createdAt).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {entry.tokensUsed > 0 && (
                          <span className="text-[10px] text-zinc-600">{formatTokens(entry.tokensUsed)} tok</span>
                        )}
                      </div>
                      {entry.summary && (
                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{entry.summary}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
