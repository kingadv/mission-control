'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabaseBrowser } from '@/lib/supabase-browser'

interface AuthContext {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthCtx = createContext<AuthContext>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthCtx)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabaseBrowser.auth.signOut()
  }

  return (
    <AuthCtx.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}
