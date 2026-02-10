export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

export function formatCost(n: number): string {
  return `$${n.toFixed(4)}`
}

export function timeAgo(date: string | number): string {
  const now = Date.now()
  const ts = typeof date === 'number' ? date : new Date(date).getTime()
  const diff = now - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  return `${days}d atrás`
}

export function statusLabel(s: string): string {
  switch (s) {
    case 'online': return 'Online'
    case 'working': return 'Trabalhando'
    case 'idle': return 'Idle'
    case 'offline': return 'Offline'
    default: return s
  }
}

export function statusDot(s: string): string {
  switch (s) {
    case 'online': return 'bg-green-400'
    case 'working': return 'bg-amber-400 animate-pulse'
    case 'idle': return 'bg-zinc-400'
    case 'offline': return 'bg-red-400'
    default: return 'bg-zinc-500'
  }
}
