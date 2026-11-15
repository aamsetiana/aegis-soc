'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login gagal.')
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan. Periksa koneksi internet Anda.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-full opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #ef4444 0%, transparent 50%)' }} />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#ef4444 1px, transparent 1px), linear-gradient(90deg, #ef4444 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/30 mb-4 shadow-lg shadow-red-500/10">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">AegisSOC</h1>
          <p className="text-slate-400 text-sm mt-1">Security Operations Center Platform</p>
        </div>

        {/* Card */}
        <div className="bg-[#111118] border border-white/5 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-1">Selamat Datang Kembali</h2>
          <p className="text-slate-400 text-sm mb-6">Masuk ke dasbor SOC Anda</p>

          {error && (
            <div className="flex items-start gap-3 p-3 mb-5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Alamat Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@aegissoc.io"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 shadow-lg shadow-red-600/20 hover:shadow-red-500/30 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Memverifikasi...</>
              ) : (
                'Masuk ke SOC'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Belum punya akun?{' '}
            <Link href="/register" className="text-red-400 hover:text-red-300 transition-colors font-medium">
              Daftar Sekarang
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-500">
          <p className="font-medium text-slate-400 mb-2">Akun Pengujian Demo (Database Neon):</p>
          <div className="space-y-1">
            <p>🔴 Komandan (Commander): commander@aegissoc.io</p>
            <p>🟡 Petugas (Responder): responder@aegissoc.io</p>
            <p>🟢 Analis (Analyst): analyst@aegissoc.io</p>
            <p className="mt-1">Kata Sandi: PasswordAegis!2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}
