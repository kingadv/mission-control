'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/', label: 'Home', icon: '🏠', exact: true },
  { href: '/brain', label: 'Second Brain', icon: '🧠' },
]

const comingSoonItems = [
  { label: 'Agents', icon: '🤖' },
  { label: 'Timeline', icon: '🕒' },
  { label: 'Settings', icon: '⚙️' },
]

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar() {
  const pathname = usePathname()
  const [openMobile, setOpenMobile] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpenMobile((v) => !v)}
        className="md:hidden fixed top-4 left-4 z-50 rounded-xl border border-zinc-700 bg-zinc-900/90 px-3 py-2 text-sm backdrop-blur"
        aria-label="Abrir menu"
      >
        {openMobile ? '✕' : '☰'}
      </button>

      {openMobile && (
        <button
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpenMobile(false)}
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 border-r border-zinc-800/80 bg-zinc-950/95 backdrop-blur transition-transform duration-200 ${
          openMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="px-5 py-6 border-b border-zinc-800/80">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛰️</span>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Mission Control</h2>
                <p className="text-xs text-zinc-500">Painel OpenClaw</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpenMobile(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_18px_rgba(34,211,238,0.15)]'
                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="px-4 mt-2">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2 px-2">Em breve</p>
            <div className="space-y-2">
              {comingSoonItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-zinc-500 border border-zinc-900 bg-zinc-950"
                >
                  <div className="flex items-center gap-3">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] uppercase">soon</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto p-4 text-[11px] text-zinc-600 border-t border-zinc-800/80 pt-4">
            Powered by <span className="text-zinc-400">OpenClaw</span>
          </div>
        </div>
      </aside>
    </>
  )
}
