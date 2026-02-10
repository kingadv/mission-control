'use client'

import { AgentEvent, AGENTS, AgentId } from '@/lib/types'
import { formatTokens, formatCost, timeAgo } from '@/lib/format'

interface ActivityFeedProps {
  events: AgentEvent[]
}

function eventIcon(type: string): string {
  switch (type) {
    case 'message': return '💬'
    case 'tool_call': return '🔧'
    case 'error': return '❌'
    case 'spawn': return '🚀'
    case 'cost_alert': return '⚠️'
    case 'session_start': return '▶️'
    case 'session_end': return '⏹️'
    case 'snapshot': return '📸'
    default: return '📋'
  }
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold mb-4">Activity Feed</h2>
        <p className="text-zinc-500 text-sm text-center py-8">Nenhuma atividade registrada ainda</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-800 p-6">
      <h2 className="text-lg font-semibold mb-4">Activity Feed</h2>
      <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
        {events.map((event) => {
          const agent = AGENTS[event.agent as AgentId]
          return (
            <div
              key={event.id}
              className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors"
            >
              <span className="text-sm mt-0.5">{eventIcon(event.eventType)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${agent?.color || 'text-zinc-400'}`}>
                    {agent?.name || event.agent}
                  </span>
                  <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
                    {event.eventType}
                  </span>
                  {event.tokensUsed > 0 && (
                    <span className="text-[10px] text-zinc-500">{formatTokens(event.tokensUsed)} tok</span>
                  )}
                  {event.cost > 0 && (
                    <span className="text-[10px] text-zinc-500">{formatCost(event.cost)}</span>
                  )}
                </div>
                {event.summary && (
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">{event.summary}</p>
                )}
              </div>
              <span className="text-[10px] text-zinc-600 whitespace-nowrap mt-1">
                {timeAgo(event.createdAt)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
