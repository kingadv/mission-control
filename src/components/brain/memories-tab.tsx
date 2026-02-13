'use client'

import { useState, useEffect, useMemo } from 'react'
import { AGENTS, AgentId } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'

interface Memory {
  agent: AgentId
  filename: string
  path: string
  date: string | null
  content: string
  mtime: number
  size: number
  matches?: Array<{
    lineNumber: number
    context: string
  }>
}

interface MemoryResponse {
  memories: Memory[]
}

interface SearchResponse {
  results: Memory[]
  query: string
}

export function MemoriesTab() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [agentFilter, setAgentFilter] = useState<AgentId | 'all'>('all')
  const [dateFilter, setDateFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedMemory, setExpandedMemory] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const fetchMemories = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (agentFilter !== 'all') params.set('agent', agentFilter)
      if (dateFilter) params.set('date', dateFilter)
      
      const url = `/api/brain/memories${params.toString() ? `?${params}` : ''}`
      const response = await fetch(url)
      
      if (response.ok) {
        const data: MemoryResponse = await response.json()
        setMemories(data.memories)
      }
    } catch (error) {
      console.error('Failed to fetch memories:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchMemories = async (query: string) => {
    if (!query.trim()) {
      fetchMemories()
      return
    }
    
    setIsSearching(true)
    try {
      const response = await fetch(`/api/brain/memories/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data: SearchResponse = await response.json()
        setMemories(data.results)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    fetchMemories()
  }, [agentFilter, dateFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchMemories(searchQuery)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchQuery])

  const filteredMemories = useMemo(() => {
    return memories
  }, [memories])

  const highlightText = (text: string, query: string) => {
    if (!query) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-300 text-black">$1</mark>')
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
        {/* Agent Filter */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-400 mb-2">Agente</label>
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value as AgentId | 'all')}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Todos os agentes</option>
            {Object.entries(AGENTS).map(([id, agent]) => (
              <option key={id} value={id}>
                {agent.emoji} {agent.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-400 mb-2">Data</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Search */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-400 mb-2">Busca</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar nas memórias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:border-cyan-500"
            />
            <div className="absolute left-3 top-2.5 text-zinc-500">
              {isSearching ? (
                <div className="w-3 h-3 border border-zinc-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-xs">🔍</span>
              )}
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setAgentFilter('all')
              setDateFilter('')
              setSearchQuery('')
            }}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-500 text-sm">Carregando memórias...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMemories.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
              <span className="text-4xl mb-4 block">🧠</span>
              <p className="text-zinc-400 text-lg mb-2">Nenhuma memória encontrada</p>
              <p className="text-zinc-600 text-sm">
                {searchQuery ? 'Tente uma busca diferente' : 'Ajuste os filtros ou aguarde novos registros'}
              </p>
            </div>
          ) : (
            filteredMemories.map((memory, index) => {
              const agent = AGENTS[memory.agent]
              const isExpanded = expandedMemory === `${memory.path}-${index}`
              
              return (
                <div key={`${memory.path}-${index}`} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{agent.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${agent.color}`}>{agent.name}</span>
                            <span className="text-zinc-500 text-sm">{memory.filename}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                            {memory.date && (
                              <span>📅 {memory.date}</span>
                            )}
                            <span>
                              📄 {(memory.size / 1024).toFixed(1)}KB
                            </span>
                            <span>
                              🕒 {formatDistanceToNow(new Date(memory.mtime), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedMemory(isExpanded ? null : `${memory.path}-${index}`)}
                        className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md transition-colors"
                      >
                        {isExpanded ? 'Fechar' : 'Ver mais'}
                      </button>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="p-4">
                    {memory.matches && memory.matches.length > 0 ? (
                      // Search results with context
                      <div className="space-y-3">
                        <p className="text-xs text-zinc-500 mb-2">
                          {memory.matches.length} resultado{memory.matches.length !== 1 ? 's' : ''}
                        </p>
                        {memory.matches.map((match, i) => (
                          <div key={i} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                            <div className="text-xs text-zinc-500 mb-1">Linha {match.lineNumber}</div>
                            <div 
                              className="text-sm text-zinc-300 leading-relaxed"
                              dangerouslySetInnerHTML={{ 
                                __html: highlightText(match.context, searchQuery) 
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : isExpanded ? (
                      // Full content
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{memory.content}</ReactMarkdown>
                      </div>
                    ) : (
                      // Content preview
                      <div className="text-sm text-zinc-400 leading-relaxed">
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(
                              memory.content.substring(0, 300) + (memory.content.length > 300 ? '...' : ''), 
                              searchQuery
                            )
                          }} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}