'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShieldAlert, AlertCircle, Loader2, Lock, Flame } from 'lucide-react'
import Link from 'next/link'

const categories = [
  'PHISHING',
  'MALWARE',
  'RANSOMWARE',
  'UNAUTHORIZED_ACCESS',
  'DDOS',
  'DATA_LEAK',
  'INSIDER_THREAT',
  'OTHER',
]

const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const tlpOptions = ['RED', 'AMBER', 'GREEN', 'WHITE']

const categoryLabels: Record<string, string> = {
  PHISHING: 'Serangan Phishing / Email Tipuan',
  MALWARE: 'Infeksi Malware / Trojan',
  RANSOMWARE: 'Serangan Enkripsi Ransomware',
  UNAUTHORIZED_ACCESS: 'Akses Tanpa Izin / Kompromi Akun',
  DDOS: 'Serangan Penolakan Layanan (DDoS)',
  DATA_LEAK: 'Kebocoran / Pencurian Data Sensitif',
  INSIDER_THREAT: 'Ancaman Orang Dalam (Insider Threat)',
  OTHER: 'Insiden Keamanan Siber Lainnya',
}

const severityLabels: Record<string, string> = {
  CRITICAL: 'Kritis (Critical - Dampak Masif)',
  HIGH: 'Tinggi (High - Sistem Utama Terganggu)',
  MEDIUM: 'Sedang (Medium - Operasional Terbatas)',
  LOW: 'Rendah (Low - Anomali Ringan)',
}

const tlpDesc: Record<string, string> = {
  RED: 'Sangat Rahasia: Hanya Commander & Assignee langsung (Penanganan Khusus)',
  AMBER: 'Rahasia Internal: Hanya dapat diakses oleh tim inti Incident Response & Commander',
  GREEN: 'Terbuka Terbatas: Terlihat oleh seluruh personel SOC terdaftar (termasuk Analyst)',
  WHITE: 'Publik / Clear: Informasi dapat didistribusikan secara bebas tanpa batasan TLP',
}

const tlpColors: Record<string, string> = {
  RED: 'border-red-500 bg-red-500/10 text-red-400 shadow-sm shadow-red-500/20',
  AMBER: 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-sm shadow-amber-500/20',
  GREEN: 'border-green-500 bg-green-500/10 text-green-400 shadow-sm shadow-green-500/20',
  WHITE: 'border-slate-400 bg-slate-500/10 text-slate-200',
}

export default function NewIncidentPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'PHISHING',
    severity: 'HIGH',
    tlp: 'AMBER',
    affectedSystems: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal mendaftarkan insiden.')
        return
      }

      router.push(`/incidents/${data.id}`)
      router.refresh()
    } catch {
      setError('Terjadi kendala jaringan atau server.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all'
  const selectClass =
    'w-full px-4 py-3 rounded-xl bg-[#11131a] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-red-500/50 transition-all'

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 pb-16">
      <div className="border-b border-white/[0.06] px-8 py-5 flex items-center justify-between bg-[#0b0c10]/80 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href="/incidents"
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Laporkan Kasus Insiden Baru
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Standar Pendaftaran NIST SP 800-61 Rev. 2 • Klasifikasi Traffic Light Protocol (TLP)
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bagian 1: Informasi Dasar */}
          <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Informasi Umum Kasus
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Judul Insiden * <span className="text-slate-500">(Minimal 5 karakter)</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: Indikasi Ransomware pada Server Database Keuangan"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Kronologi & Temuan Awal *{' '}
                <span className="text-slate-500">(Minimal 20 karakter)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Tuliskan kronologi deteksi: tanggal/jam, indikasi awal, dampak yang dialami sistem, log yang dicurigai..."
                required
                rows={5}
                className={inputClass + ' resize-none'}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Sistem atau Host yang Terdampak
              </label>
              <input
                type="text"
                value={form.affectedSystems}
                onChange={(e) => setForm({ ...form, affectedSystems: e.target.value })}
                placeholder="Contoh: PROD-SRV-01, DB-CLUSTER, 192.168.10.15"
                className={inputClass}
              />
            </div>
          </div>

          {/* Bagian 2: Klasifikasi Ancaman & TLP */}
          <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Klasifikasi & Tingkat Risiko
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Kategori Serangan *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={selectClass}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {categoryLabels[c]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tingkat Keparahan (Severity) *
                </label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className={selectClass}
                >
                  {severities.map((s) => (
                    <option key={s} value={s}>
                      {severityLabels[s] || s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TLP Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-red-400" />
                Klasifikasi Kerahasiaan (Traffic Light Protocol 2.0) *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tlpOptions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, tlp: t })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      form.tlp === t
                        ? tlpColors[t]
                        : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="font-mono font-bold text-xs">TLP:{t}</div>
                    <div className="text-[11px] opacity-80 mt-1 leading-snug">{tlpDesc[t]}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/incidents"
              className="px-5 py-2.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs font-medium transition-all"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-semibold shadow-lg shadow-red-600/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Mendaftarkan Kasus...
                </>
              ) : (
                'Simpan & Daftarkan Insiden'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
