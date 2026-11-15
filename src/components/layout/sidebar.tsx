'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  Radar,
  FileText,
  Activity,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Database,
} from 'lucide-react'
import { cn, getRoleLabel } from '@/lib/utils'
import { SessionPayload } from '@/lib/security/session'

const navItems = [
  { label: 'Dasbor Utama', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Insiden Keamanan', href: '/incidents', icon: AlertTriangle },
  { label: 'Pelacak Ancaman (IOC)', href: '/ioc', icon: Radar },
  { label: 'Laporan Eksekutif', href: '/reports', icon: FileText, divider: true },
  { label: 'Jejak Audit (Logs)', href: '/audit-logs', icon: Activity },
  { label: 'Tim & Hak Akses (RBAC)', href: '/team', icon: Users, divider: true },
  { label: 'Kepatuhan Keamanan', href: '/security', icon: Settings },
]

interface SidebarProps {
  user: SessionPayload
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      window.location.href = '/login'
    }
  }

  const roleColors: Record<string, string> = {
    COMMANDER: 'text-red-400 bg-red-500/10 border-red-500/30',
    RESPONDER: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    ANALYST: 'text-green-400 bg-green-500/10 border-green-500/30',
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0d0f14]/90 backdrop-blur-xl border-r border-white/[0.06] flex flex-col z-30 select-none">
      {/* Brand Logo with Red Glow */}
      <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:shadow-red-500/50 transition-all">
            <Shield className="w-5 h-5 text-white" />
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
              AegisSOC
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
              Tanggap Insiden Siber
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <div key={item.href}>
              {item.divider && <div className="my-2 border-t border-white/[0.06]" />}
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                  isActive
                    ? 'bg-gradient-to-r from-red-600/20 to-orange-600/10 text-white border border-red-500/30 shadow-lg shadow-red-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 flex-shrink-0 transition-colors',
                    isActive
                      ? 'text-red-400'
                      : 'text-slate-500 group-hover:text-slate-300'
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm shadow-red-500" />
                )}
              </Link>
            </div>
          )
        })}
      </nav>

      {/* User Information & Role */}
      <div className="p-3 border-t border-white/[0.06] bg-black/20">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600/40 via-red-800/40 to-orange-600/40 border border-red-500/30 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user.name}</div>
            <div
              className={cn(
                'text-[10px] font-mono px-1.5 py-0.5 rounded border inline-block mt-0.5 font-medium',
                roleColors[user.role] || 'text-slate-400 border-slate-700'
              )}
            >
              {user.role}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Keluar / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
