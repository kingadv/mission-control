'use client'

import { useState, useEffect } from 'react'
import { AGENTS, AgentId } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AgentTask {
  from_agent: string
  to_agent: string
  message: string
  created_at: string
}

interface TasksResponse {
  tasks: AgentTask[]
}

export function TasksTab() {
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [loading, setLoading] = useState(true)
  const [agentFilter, setAgentFilter] = useState<AgentId | 'all'>('all')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/brain/tasks')
      if (response.ok) {
        const data: TasksResponse = await response.json()
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (agentFilter === 'all') return true
    return task.from_agent === agentFilter || task.to_agent === agentFilter
  })

  const getAgentInfo = (agentName: string) => {
    const agent = Object.values(AGENTS).find(a => a.id === agentName)
    if (agent) return agent
    
    // Fallback for unknown agents
    return {
      id: agentName as AgentId,
      name: agentName,
      emoji: '🤖',
      color: 'text-zinc-400',
      role: 'Unknown',
      accentBg: 'bg-zinc-500/10 border-zinc-500/20'
    }
  }

  const truncateMessage = (message: string, maxLength = 150) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  const getMessageIcon = (message: string) => {
    const msg = message.toLowerCase()
    if (msg.includes('deploy')) return '🚀'
    if (msg.includes('pesquisa')) return '🔍'
    if (msg.includes('erro') || msg.includes('error')) return '❌'
    if (msg.includes('sucesso') || msg.includes('success')) return '✅'
    if (msg.includes('task') || msg.includes('tarefa')) return '📋'
    if (msg.includes('brain') || msg.includes('cerebro')) return '🧠'
    return '💬'
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-zinc-500 text-sm">Carregando tarefas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-400 mb-2">Filtrar por agente</label>
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
        <div className="flex items-end">
          <button
            onClick={() => setAgentFilter('all')}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Tasks Timeline */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
          <span className="text-4xl mb-4 block">🔄</span>
          <p className="text-zinc-400 text-lg mb-2">Nenhuma tarefa encontrada</p>
          <p className="text-zinc-600 text-sm">
            {agentFilter !== 'all' 
              ? 'Tente selecionar outro agente' 
              : 'As comunicações entre agentes aparecerão aqui'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-zinc-500 text-sm">
            {filteredTasks.length} comunicação{filteredTasks.length !== 1 ? 'ões' : ''} encontrada{filteredTasks.length !== 1 ? 's' : ''}
          </p>
          
          <div className="space-y-4">
            {filteredTasks.map((task, index) => {
              const fromAgent = getAgentInfo(task.from_agent)
              const toAgent = getAgentInfo(task.to_agent)
              const icon = getMessageIcon(task.message)
              
              return (
                <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg">{icon}</span>
                    <div className="flex items-center gap-2 flex-1">
                      {/* From Agent */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{fromAgent.emoji}</span>
                        <span className={`font-medium ${fromAgent.color}`}>
                          {fromAgent.name}
                        </span>
                      </div>
                      
                      {/* Arrow */}
                      <span className="text-zinc-500 mx-2">→</span>
                      
                      {/* To Agent */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{toAgent.emoji}</span>
                        <span className={`font-medium ${toAgent.color}`}>
                          {toAgent.name}
                        </span>
                      </div>
                    </div>
                    
                    {/* Timestamp */}
                    <div className="text-xs text-zinc-500">
                      🕒 {formatDistanceToNow(new Date(task.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </div>
                  </div>
                  
                  {/* Message */}
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {truncateMessage(task.message)}
                    </p>
                    
                    {task.message.length > 150 && (
                      <details className="mt-2">
                        <summary className="text-xs text-cyan-400 cursor-pointer hover:text-cyan-300">
                          Ver mensagem completa
                        </summary>
                        <div className="mt-2 pt-2 border-t border-zinc-700">
                          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {task.message}
                          </p>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}