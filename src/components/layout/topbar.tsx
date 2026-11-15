import { Bell, Search, ShieldAlert, Sparkles } from 'lucide-react'
import { SessionPayload } from '@/lib/security/session'
import Link from 'next/link'

interface TopbarProps {
  title: string
  subtitle?: string
  user: SessionPayload
  actionButton?: {
    label: string
    href: string
  }
}

export function Topbar({ title, subtitle, user, actionButton }: TopbarProps) {
  return (
    <header className="h-18 border-b border-white/[0.06] flex items-center justify-between px-8 bg-[#0b0c10]/80 backdrop-blur-md sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Cari ID, IP, IOC, hash..."
            className="pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 w-64 transition-all"
          />
        </div>

        {/* Check Alerts / Custom Action Button */}
        {actionButton ? (
          <Link
            href={actionButton.href}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-semibold shadow-lg shadow-red-600/25 transition-all flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {actionButton.label}
          </Link>
        ) : (
          <Link
            href="/incidents/new"
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            Periksa Peringatan
          </Link>
        )}

        {/* Notifications */}
        <button
          className="relative p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 transition-all"
          title="Notifikasi Keamanan"
        >
          <Bell className="w-4 h-4" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0b0c10] animate-ping" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0b0c10]" />
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.08]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-red-500/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
            <div className="text-[10px] text-slate-400 leading-tight">@{user.email.split('@')[0]}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
