'use client'

import { AGENTS, AgentSnapshot, AgentId } from '@/lib/types'
import { formatTokens, formatCost, timeAgo, statusDot, statusLabel } from '@/lib/format'

interface AgentCardProps {
  agent: AgentId
  snapshot: AgentSnapshot | null
}

export function AgentCard({ agent, snapshot }: AgentCardProps) {
  const info = AGENTS[agent]
  const status = snapshot?.status || 'offline'

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

      {/* Stats */}
      {snapshot ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/50 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Tokens</p>
            <p className="text-lg font-mono font-semibold">{formatTokens(snapshot.totalTokens)}</p>
          </div>
          <div className="bg-zinc-900/50 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Custo</p>
            <p className="text-lg font-mono font-semibold">{formatCost(snapshot.costTotal)}</p>
          </div>
          <div className="bg-zinc-900/50 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Modelo</p>
            <p className="text-xs font-mono truncate">{snapshot.model || '—'}</p>
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
      ) : (
        <div className="text-center py-6 text-zinc-500 text-sm">
          Sem dados ainda
        </div>
      )}
    </div>
  )
}
