'use client'

import { formatTokens, formatCost } from '@/lib/format'

interface SummaryBarProps {
  totalCost: number
  totalTokens: number
  agentCount: number
  lastUpdated: string | null
}

export function SummaryBar({ totalCost, totalTokens, agentCount, lastUpdated }: SummaryBarProps) {
  const stats = [
    { label: 'Agentes', value: agentCount.toString(), icon: '🤖' },
    { label: 'Tokens Total', value: formatTokens(totalTokens), icon: '📊' },
    { label: 'Custo Total', value: formatCost(totalCost), icon: '💰' },
    { label: 'Atualizado', value: lastUpdated ? new Date(lastUpdated).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—', icon: '🕐' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{s.icon}</span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">{s.label}</span>
          </div>
          <p className="text-xl font-mono font-bold">{s.value}</p>
        </div>
      ))}
    </div>
  )
}
