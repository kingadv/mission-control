'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth-provider'
import { LoginForm } from '@/components/login-form'
import { MemoriesTab } from '@/components/brain/memories-tab'
import { DocumentsTab } from '@/components/brain/documents-tab'
import { TasksTab } from '@/components/brain/tasks-tab'
import Link from 'next/link'

type TabType = 'memories' | 'documents' | 'tasks'

export default function BrainPage() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('memories')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-500 text-sm">Carregando Second Brain...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const tabs = [
    { id: 'memories', name: 'Memórias', icon: '🧠' },
    { id: 'documents', name: 'Documentos', icon: '📄' },
    { id: 'tasks', name: 'Tarefas', icon: '🔄' },
  ] as const

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
            <span className="text-3xl">🧠</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Second Brain</h1>
              <p className="text-zinc-500 text-sm">Memórias, documentos e tarefas dos agentes</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800 mb-6">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'memories' && <MemoriesTab />}
        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'tasks' && <TasksTab />}
      </div>
    </main>
  )
}