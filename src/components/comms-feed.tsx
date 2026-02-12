'use client'

import { useState, useRef, useEffect } from 'react'
import { AGENTS, AgentId } from '@/lib/types'

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

const BUBBLE_COLORS: Record<string, { bg: string; border: string; tail: string }> = {
  noah:  { bg: 'bg-purple-600/30', border: 'border-purple-500/40', tail: 'text-purple-500/40' },
  kai:   { bg: 'bg-amber-600/25',  border: 'border-amber-500/40',  tail: 'text-amber-500/40' },
  dora:  { bg: 'bg-blue-600/25',   border: 'border-blue-500/40',   tail: 'text-blue-500/40' },
}

const SIDES: Record<string, 'left' | 'right'> = {
  noah: 'left',
  kai: 'right',
  dora: 'left',
}

function CommBubble({ comm }: { comm: AgentComm }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = comm.message.length > MAX_CHARS
  const agent = AGENTS[comm.from as AgentId]
  const toAgent = AGENTS[comm.to as AgentId]
  const colors = BUBBLE_COLORS[comm.from] || BUBBLE_COLORS.noah
  const side = SIDES[comm.from] || 'left'
  const isRight = side === 'right'

  const time = new Date(comm.createdAt).toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex items-end gap-2 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-base border border-zinc-700/50 mb-5">
        {agent?.emoji || '🤖'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] min-w-[140px] ${isRight ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Name + recipient */}
        <div className={`flex items-center gap-1.5 mb-0.5 px-1 ${isRight ? 'flex-row-reverse' : ''}`}>
          <span className={`text-[11px] font-semibold ${agent?.color || 'text-zinc-400'}`}>
            {agent?.name || comm.from}
          </span>
          <span className="text-zinc-600 text-[10px]">→</span>
          <span className={`text-[11px] ${toAgent?.color || 'text-zinc-400'}`}>
            {toAgent?.name || comm.to}
          </span>
        </div>

        {/* Bubble body with tail */}
        <div className="relative">
          {/* Tail */}
          <div className={`absolute bottom-2 ${isRight ? '-right-[6px]' : '-left-[6px]'} ${colors.tail}`}>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" className={isRight ? '' : 'scale-x-[-1]'}>
              <path d="M0 0C0 0 1 8 8 14H0V0Z" fill="currentColor" />
            </svg>
          </div>

          <div className={`${colors.bg} border ${colors.border} rounded-2xl ${isRight ? 'rounded-br-sm' : 'rounded-bl-sm'} px-3 py-2`}>
            <div
              className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
              style={{ maxHeight: expanded || !isLong ? '2000px' : '3.2em' }}
            >
              <p className="text-sm text-zinc-200 whitespace-pre-wrap break-words leading-snug">{comm.message}</p>
            </div>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 mt-1 transition-colors"
              >
                {expanded ? 'Ver menos ↑' : 'Ver mais ↓'}
              </button>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <span className={`text-[10px] text-zinc-600 mt-0.5 px-1 ${isRight ? 'self-end' : 'self-start'}`}>
          {time}
        </span>
      </div>
    </div>
  )
}

export function CommsFeed({ comms }: CommsFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [comms])

  if (comms.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">💬</span>
          <h2 className="text-lg font-semibold">Comunicação do Time</h2>
        </div>
        <p className="text-zinc-500 text-sm text-center py-8">Nenhuma comunicação registrada ainda</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💬</span>
        <h2 className="text-lg font-semibold">Comunicação do Time</h2>
      </div>
      <div ref={scrollRef} className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scroll-smooth">
        {comms.map((comm) => (
          <CommBubble key={comm.id} comm={comm} />
        ))}
      </div>
    </div>
  )
}
