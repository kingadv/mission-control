'use client'

import { formatTokens, formatPercent } from '@/lib/format'

interface SummaryBarProps {
  totalTokens: number
  agentCount: number
  avgContext: number
  maxContextAgent: string | null
  maxContextPct: number
  lastUpdated: string | null
}

export function SummaryBar({ totalTokens, agentCount, avgContext, maxContextAgent, maxContextPct, lastUpdated }: SummaryBarProps) {
  const contextAlert = maxContextPct >= 80

  const stats = [
    { label: 'Agentes', value: agentCount.toString(), icon: '🤖' },
    { label: 'Tokens Total', value: formatTokens(totalTokens), icon: '📊' },
    {
      label: 'Maior Contexto',
      value: maxContextAgent ? `${maxContextAgent} ${formatPercent(maxContextPct)}` : '—',
      icon: contextAlert ? '⚠️' : '🧠',
      alert: contextAlert,
    },
    { label: 'Atualizado', value: lastUpdated ? new Date(lastUpdated).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—', icon: '🕐' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className={`bg-zinc-900 border rounded-xl p-4 ${
          (s as any).alert ? 'border-red-500/30 bg-red-500/5' : 'border-zinc-800'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{s.icon}</span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">{s.label}</span>
          </div>
          <p className={`text-xl font-mono font-bold ${(s as any).alert ? 'text-red-400' : ''}`}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}
