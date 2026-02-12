'use client'

import { useState } from 'react'
import { AGENTS, AgentId } from '@/lib/types'
import { timeAgo } from '@/lib/format'

export interface AgentComm {
  id: string
  from: string
  to: string
  message: string
  createdAt: string
}

interface CommsFeedProps {
  comms: AgentComm[]
}

const MAX_CHARS = 150

function CommMessage({ message }: { message: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = message.length > MAX_CHARS

  return (
    <div className="bg-zinc-800/70 rounded-lg px-3 py-2 border border-zinc-700/30">
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: expanded || !isLong ? '2000px' : '3.2em' }}
      >
        <p className="text-sm text-zinc-300 whitespace-pre-wrap break-words">{message}</p>
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] text-zinc-500 hover:text-zinc-300 mt-1 transition-colors"
        >
          {expanded ? 'Ver menos ↑' : 'Ver mais ↓'}
        </button>
      )}
    </div>
  )
}

export function CommsFeed({ comms }: CommsFeedProps) {
  if (comms.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">💬</span>
          <h2 className="text-lg font-semibold">Comunicação do Time</h2>
        </div>
        <p className="text-zinc-500 text-sm text-center py-8">Nenhuma comunicação registrada ainda</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💬</span>
        <h2 className="text-lg font-semibold">Comunicação do Time</h2>
      </div>
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {comms.map((comm) => {
          const fromAgent = AGENTS[comm.from as AgentId]
          const toAgent = AGENTS[comm.to as AgentId]

          return (
            <div key={comm.id} className="group">
              <div className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                <span className="text-lg mt-0.5 shrink-0">{fromAgent?.emoji || '🤖'}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-xs font-semibold ${fromAgent?.color || 'text-zinc-400'}`}>
                      {fromAgent?.name || comm.from}
                    </span>
                    <span className="text-zinc-600 text-xs">→</span>
                    <span className={`text-xs font-semibold ${toAgent?.color || 'text-zinc-400'}`}>
                      {toAgent?.name || comm.to}
                    </span>
                    <span className="text-[10px] text-zinc-600 ml-auto">
                      {timeAgo(comm.createdAt)}
                    </span>
                  </div>

                  <CommMessage message={comm.message} />

                  <p className="text-[9px] text-zinc-600 mt-1 font-mono">
                    {new Date(comm.createdAt).toLocaleTimeString('pt-BR', {
                      timeZone: 'America/Sao_Paulo',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
