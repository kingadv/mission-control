'use client'

import { AgentTask, AGENTS, AgentId } from '@/lib/types'
import { formatTokens, timeAgo } from '@/lib/format'

interface TasksPanelProps {
  tasks: AgentTask[]
}

function taskStatusIcon(status: string): string {
  switch (status) {
    case 'running': return '🔄'
    case 'completed': return '✅'
    case 'error': return '❌'
    default: return '📋'
  }
}

function taskStatusStyle(status: string): string {
  switch (status) {
    case 'running': return 'bg-amber-500/10 border-amber-500/20 text-amber-400'
    case 'completed': return 'bg-green-500/10 border-green-500/20 text-green-400'
    case 'error': return 'bg-red-500/10 border-red-500/20 text-red-400'
    default: return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
  }
}

export function TasksPanel({ tasks }: TasksPanelProps) {
  const running = tasks.filter(t => t.status === 'running')
  const recent = tasks.filter(t => t.status !== 'running').slice(0, 10)

  return (
    <div className="rounded-xl border border-zinc-800 p-6">
      <h2 className="text-lg font-semibold mb-4">Tasks dos Agentes</h2>

      {/* Running tasks */}
      {running.length > 0 && (
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">🔄 Em execução</p>
          <div className="space-y-2">
            {running.map(task => {
              const agent = AGENTS[task.agent as AgentId]
              return (
                <div key={task.id} className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{agent?.emoji}</span>
                    <span className={`text-xs font-medium ${agent?.color}`}>{agent?.name}</span>
                    <span className="text-[10px] text-zinc-500">{timeAgo(task.startedAt)}</span>
                  </div>
                  <p className="text-sm text-zinc-200">{task.summary}</p>
                  {task.tokensUsed > 0 && (
                    <p className="text-[10px] text-zinc-500 mt-1">{formatTokens(task.tokensUsed)} tokens usados</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent completed */}
      {recent.length > 0 ? (
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Recentes</p>
          <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1">
            {recent.map(task => {
              const agent = AGENTS[task.agent as AgentId]
              return (
                <div key={task.id} className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                  <span className="text-sm mt-0.5">{taskStatusIcon(task.status)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${agent?.color}`}>{agent?.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${taskStatusStyle(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 truncate">{task.summary}</p>
                  </div>
                  <span className="text-[10px] text-zinc-600 whitespace-nowrap mt-1">
                    {timeAgo(task.completedAt || task.startedAt)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : running.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-6">Nenhuma task registrada ainda</p>
      ) : null}
    </div>
  )
}
