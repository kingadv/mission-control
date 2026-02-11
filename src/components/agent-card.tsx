'use client'

import { useState } from 'react'
import { AGENTS, AgentSnapshot, AgentId } from '@/lib/types'
import { formatTokens, formatPercent, timeAgo, statusDot, statusLabel, contextColor, contextBarColor } from '@/lib/format'

interface AgentCardProps {
  agent: AgentId
  snapshot: AgentSnapshot | null
  onKill?: (agent: AgentId, reason: string) => void
}

export function AgentCard({ agent, snapshot, onKill }: AgentCardProps) {
  const info = AGENTS[agent]
  const status = snapshot?.status || 'offline'
  const contextPct = snapshot?.contextPercent || 0
  const [showKill, setShowKill] = useState(false)
  const [killReason, setKillReason] = useState('')
  const [killing, setKilling] = useState(false)

  const handleKill = async () => {
    if (!onKill) return
    setKilling(true)
    onKill(agent, killReason || 'Kill switch manual')
    setTimeout(() => {
      setKilling(false)
      setShowKill(false)
      setKillReason('')
    }, 1000)
  }

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
          {(status === 'working' || status === 'online') && (
            <button
              onClick={() => setShowKill(!showKill)}
              className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors ml-1"
              title="Kill switch"
            >
              ⏹
            </button>
          )}
        </div>
      </div>

      {/* Kill switch dialog */}
      {showKill && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 mb-3">
          <p className="text-xs text-red-400 font-medium mb-2">🛑 Parar {info.name}?</p>
          <input
            value={killReason}
            onChange={e => setKillReason(e.target.value)}
            placeholder="Motivo (opcional)"
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs mb-2 focus:outline-none focus:border-red-500/50"
          />
          <div className="flex gap-2">
            <button
              onClick={handleKill}
              disabled={killing}
              className="flex-1 bg-red-600 text-white text-xs rounded py-1.5 font-medium hover:bg-red-500 disabled:opacity-50 transition-colors"
            >
              {killing ? 'Parando...' : 'Confirmar'}
            </button>
            <button
              onClick={() => setShowKill(false)}
              className="px-3 bg-zinc-800 text-xs rounded py-1.5 hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
