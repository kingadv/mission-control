'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password })
    
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🛰️</span>
          <h1 className="text-2xl font-bold mt-3">Mission Control</h1>
          <p className="text-zinc-500 text-sm mt-1">Login para acessar o dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black rounded-lg py-2.5 font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
