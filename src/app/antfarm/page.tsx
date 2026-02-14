'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { LoginForm } from '@/components/login-form'
import Link from 'next/link'

interface WorkflowRun {
  id: string
  fullId: string
  status: 'completed' | 'running' | 'failed' | 'pending'
  workflow: string
  task: string
  createdAt: string
}

interface RunModalProps {
  workflows: string[]
  onClose: () => void
  onSubmit: (workflowId: string, task: string) => void
}

function RunModal({ workflows, onClose, onSubmit }: RunModalProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState(workflows[0] || '')
  const [task, setTask] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedWorkflow && task.trim()) {
      onSubmit(selectedWorkflow, task.trim())
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md mx-4 border border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Executar Workflow</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Workflow
            </label>
            <select
              value={selectedWorkflow}
              onChange={(e) => setSelectedWorkflow(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-cyan-400"
            >
              {workflows.map(workflow => (
                <option key={workflow} value={workflow}>
                  {workflow}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Tarefa
            </label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Descreva a tarefa a ser executada..."
              rows={4}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-cyan-400 resize-none"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedWorkflow || !task.trim()}
              className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Executar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AntfarmPage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [workflows, setWorkflows] = useState<string[]>([])
  const [showRunModal, setShowRunModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setError(null)
      const [runsRes, workflowsRes] = await Promise.all([
        fetch('/api/antfarm/runs'),
        fetch('/api/antfarm/workflows')
      ])

      if (runsRes.ok) {
        const runsData = await runsRes.json()
        setRuns(runsData.runs || [])
      }

      if (workflowsRes.ok) {
        const workflowsData = await workflowsRes.json()
        setWorkflows(workflowsData.workflows || [])
      }
    } catch (err) {
      setError('Falha ao carregar dados do Antfarm')
      console.error('Error fetching Antfarm data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [user])

  const handleRunWorkflow = async (workflowId: string, task: string) => {
    try {
      const response = await fetch('/api/antfarm/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId, task })
      })

      if (response.ok) {
        // Refresh runs after successful execution
        await fetchData()
      } else {
        const error = await response.json()
        setError(`Erro ao executar workflow: ${error.error}`)
      }
    } catch (err) {
      setError('Erro ao executar workflow')
      console.error('Error running workflow:', err)
    }
  }

  const handleResumeRun = async (runId: string) => {
    try {
      const response = await fetch('/api/antfarm/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId })
      })

      if (response.ok) {
        await fetchData()
      } else {
        const error = await response.json()
        setError(`Erro ao retomar workflow: ${error.error}`)
      }
    } catch (err) {
      setError('Erro ao retomar workflow')
      console.error('Error resuming workflow:', err)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-900/30 text-green-400 border-green-600/30',
      running: 'bg-cyan-900/30 text-cyan-400 border-cyan-600/30',
      failed: 'bg-red-900/30 text-red-400 border-red-600/30',
      pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-600/30'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const getStats = () => {
    const total = runs.length
    const active = runs.filter(r => r.status === 'running').length
    const failed = runs.filter(r => r.status === 'failed').length
    const completed = runs.filter(r => r.status === 'completed').length
    return { total, active, failed, completed }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-500 text-sm">Carregando Antfarm...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const stats = getStats()

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="text-2xl hover:opacity-70 transition-opacity"
          >
            🛰️
          </Link>
          <div className="text-2xl">→</div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐜</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Antfarm</h1>
              <p className="text-zinc-500 text-sm">Automação de workflows e tarefas</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{user?.email}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-600/30 rounded-xl text-red-400">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-300 hover:text-red-100"
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-zinc-500 text-sm">Carregando dados...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-zinc-500">Total de runs</div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
              <div className="text-2xl font-bold text-cyan-400">{stats.active}</div>
              <div className="text-sm text-zinc-500">Execuções ativas</div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
              <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
              <div className="text-sm text-zinc-500">Execuções com falha</div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
              <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
              <div className="text-sm text-zinc-500">Execuções completadas</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowRunModal(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors font-medium"
            >
              Executar Workflow
            </button>
            <button
              onClick={fetchData}
              className="px-4 py-2 border border-zinc-700 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Atualizar
            </button>
          </div>

          {/* Runs Table */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold">Execuções de Workflow</h2>
            </div>
            
            {runs.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                Nenhuma execução encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800 bg-zinc-950/50">
                    <tr className="text-left">
                      <th className="p-4 text-sm font-medium text-zinc-400">ID</th>
                      <th className="p-4 text-sm font-medium text-zinc-400">Workflow</th>
                      <th className="p-4 text-sm font-medium text-zinc-400">Status</th>
                      <th className="p-4 text-sm font-medium text-zinc-400">Tarefa</th>
                      <th className="p-4 text-sm font-medium text-zinc-400">Criado</th>
                      <th className="p-4 text-sm font-medium text-zinc-400">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((run) => (
                      <tr key={run.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        <td className="p-4">
                          <code className="text-xs bg-zinc-800 px-2 py-1 rounded">
                            {run.id}
                          </code>
                        </td>
                        <td className="p-4 text-sm">{run.workflow}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(run.status)}`}>
                            {run.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm max-w-md">
                          <div className="truncate" title={run.task}>
                            {run.task}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-zinc-500">
                          {new Date(run.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="p-4">
                          {run.status === 'failed' && (
                            <button
                              onClick={() => handleResumeRun(run.fullId)}
                              className="text-xs px-3 py-1 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 rounded hover:bg-yellow-600/30 transition-colors"
                            >
                              Retomar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Dashboard Link */}
          <div className="mt-8 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <h3 className="text-sm font-medium mb-2">Dashboard Completo</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Acesse o dashboard completo do Antfarm para visualização detalhada e controle avançado.
            </p>
            <a
              href="http://localhost:3333"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors text-sm"
            >
              Abrir dashboard completo
              <span className="text-xs">↗</span>
            </a>
          </div>
        </>
      )}

      {showRunModal && (
        <RunModal
          workflows={workflows}
          onClose={() => setShowRunModal(false)}
          onSubmit={handleRunWorkflow}
        />
      )}
    </main>
  )
}