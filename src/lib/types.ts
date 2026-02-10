export type AgentId = 'noah' | 'kai' | 'dora'
export type AgentStatus = 'online' | 'working' | 'idle' | 'offline'

export interface AgentInfo {
  id: AgentId
  name: string
  emoji: string
  role: string
  color: string
  accentBg: string
}

export const AGENTS: Record<AgentId, AgentInfo> = {
  noah: { id: 'noah', name: 'Noah', emoji: '🧠', role: 'Orquestrador', color: 'text-purple-400', accentBg: 'bg-purple-500/10 border-purple-500/20' },
  dora: { id: 'dora', name: 'Dora', emoji: '🔍', role: 'Pesquisadora', color: 'text-blue-400', accentBg: 'bg-blue-500/10 border-blue-500/20' },
  kai: { id: 'kai', name: 'Kai', emoji: '⚡', role: 'Engenheiro', color: 'text-amber-400', accentBg: 'bg-amber-500/10 border-amber-500/20' },
}

export interface AgentSnapshot {
  agent: AgentId
  sessionKey: string
  status: AgentStatus
  model: string | null
  totalTokens: number
  contextTokens: number
  costTotal: number
  lastMessageAt: string | null
  lastChannel: string | null
  snapshotAt: string
}

export interface AgentEvent {
  id: string
  agent: AgentId
  eventType: string
  summary: string | null
  tokensUsed: number
  cost: number
  metadata: Record<string, unknown>
  createdAt: string
}

export interface SessionData {
  key: string
  agent: AgentId
  model: string
  totalTokens: number
  updatedAt: number
  lastChannel: string
  lastMessage?: string
  status: AgentStatus
}
