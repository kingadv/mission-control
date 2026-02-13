'use client'

import { useState, useEffect } from 'react'
import { AGENTS, AgentId } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Document {
  agent: AgentId
  name: string
  path: string
  relativePath: string
  size: number
  mtime: number
  extension: string
}

interface DocumentsResponse {
  documents: Document[]
}

export function DocumentsTab() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/brain/documents')
      if (response.ok) {
        const data: DocumentsResponse = await response.json()
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (extension: string) => {
    const icons: Record<string, string> = {
      '.pdf': '📄',
      '.pptx': '📊',
      '.docx': '📝',
      '.xlsx': '📈',
      '.txt': '📄',
      '.md': '📝',
      '.json': '⚙️',
      '.png': '🖼️',
      '.jpg': '🖼️',
      '.jpeg': '🖼️',
      '.gif': '🖼️',
      '.webp': '🖼️',
    }
    return icons[extension] || '📎'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(`/api/brain/documents/download?path=${encodeURIComponent(doc.relativePath)}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = window.document.createElement('a')
        a.href = url
        a.download = doc.name
        window.document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        window.document.body.removeChild(a)
      } else {
        console.error('Download failed:', response.statusText)
      }
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-zinc-500 text-sm">Carregando documentos...</p>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
        <span className="text-4xl mb-4 block">📄</span>
        <p className="text-zinc-400 text-lg mb-2">Nenhum documento encontrado</p>
        <p className="text-zinc-600 text-sm">
          Os agentes ainda não geraram documentos de saída
        </p>
      </div>
    )
  }

  // Group documents by agent
  const documentsByAgent = documents.reduce((acc, doc) => {
    if (!acc[doc.agent]) acc[doc.agent] = []
    acc[doc.agent].push(doc)
    return acc
  }, {} as Record<AgentId, Document[]>)

  return (
    <div className="space-y-6">
      {Object.entries(documentsByAgent).map(([agentId, agentDocs]) => {
        const agent = AGENTS[agentId as AgentId]
        if (!agent) return null

        return (
          <div key={agentId} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Agent Header */}
            <div className="p-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="text-xl">{agent.emoji}</span>
                <div>
                  <h3 className={`font-medium ${agent.color}`}>{agent.name}</h3>
                  <p className="text-zinc-500 text-sm">
                    {agentDocs.length} documento{agentDocs.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents Grid */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agentDocs.map((doc, index) => (
                  <div
                    key={`${doc.path}-${index}`}
                    className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0 mt-1">
                        {getFileIcon(doc.extension)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-zinc-200 truncate" title={doc.name}>
                          {doc.name}
                        </div>
                        <div className="text-xs text-zinc-500 space-y-1 mt-2">
                          <div>
                            📏 {formatFileSize(doc.size)}
                          </div>
                          <div>
                            🕒 {formatDistanceToNow(new Date(doc.mtime), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="w-full mt-3 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-md transition-colors flex items-center justify-center gap-2"
                        >
                          <span>⬇️</span>
                          Baixar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}