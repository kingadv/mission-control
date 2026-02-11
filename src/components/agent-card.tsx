'use client'

import { AGENTS, AgentSnapshot, AgentId } from '@/lib/types'
import { formatTokens, formatPercent, timeAgo, statusDot, statusLabel, contextColor, contextBarColor } from '@/lib/format'

interface AgentCardProps {
  agent: AgentId
  snapshot: AgentSnapshot | null
}

export function AgentCard({ agent, snapshot }: AgentCardProps) {
  const info = AGENTS[agent]
  const status = snapshot?.status || 'offline'
  const contextPct = snapshot?.contextPercent || 0

  return (
    <div className={`rounded-xl border p-5 transition-all hover:border-zinc-600 ${info.accentBg}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{info.emoji}</span>
          <div>
            <h3 className="font-semibold text-lg">{info.name}</h3>
            <p className="text-xs text-zinc-400">{info.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${statusDot(status)}`} />
          <span className="text-xs text-zinc-400">{statusLabel(status)}</span>
        </div>
      </div>

      {/* Current task */}
      {snapshot?.currentTask && (
        <div className="bg-zinc-900/60 rounded-lg px-3 py-2 mb-3 border border-zinc-700/30">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">Fazendo agora</p>
          <p className="text-xs text-zinc-300 line-clamp-2">{snapshot.currentTask}</p>
        </div>
      )}

      {/* Stats */}
      {snapshot ? (
        <>
          {/* Context usage bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Contexto</span>
              <span className={`text-xs font-mono font-semibold ${contextColor(contextPct)}`}>
                {formatPercent(contextPct)}
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${contextBarColor(contextPct)}`}
                style={{ width: `${Math.min(contextPct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-zinc-600 font-mono">{formatTokens(snapshot.totalTokens)}</span>
              <span className="text-[9px] text-zinc-600 font-mono">{formatTokens(snapshot.contextTokens)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/50 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Modelo</p>
              <p className="text-xs font-mono truncate">{snapshot.model?.replace('claude-', '')?.replace('anthropic/', '') || '—'}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Última msg</p>
              <p className="text-xs font-mono">{snapshot.lastMessageAt ? timeAgo(snapshot.lastMessageAt) : '—'}</p>
              {snapshot.lastMessageAt && (
                <p className="text-[9px] text-zinc-600 font-mono mt-0.5">
                  {new Date(snapshot.lastMessageAt).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-6 text-zinc-500 text-sm">
          Sem dados ainda
        </div>
      )}
    </div>
  )
}
