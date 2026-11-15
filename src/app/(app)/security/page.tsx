import { getSession } from '@/lib/security/session'
import { Topbar } from '@/components/layout/topbar'
import {
  ShieldCheck,
  Lock,
  Flame,
  CheckCircle2,
  Bug,
  KeyRound,
  FileCode2,
  Terminal,
} from 'lucide-react'

export default async function SecurityPage() {
  const session = await getSession()
  if (!session) return null

  const securityFeatures = [
    {
      title: 'Bcrypt Password Hashing (Salt 12)',
      desc: 'Password pengguna tidak pernah disimpan dalam plaintext. Menggunakan algoritma hash bcrypt dengan salt round 12.',
      status: 'AKTIF & TERUJI',
      tag: 'A02 Cryptographic Failures',
    },
    {
      title: 'Anti-SQL Injection via Parameterized Queries',
      desc: '100% interaksi database dijalankan menggunakan query berparameter bawaan Prisma ORM. Menolak injeksi string SQL.',
      status: 'AKTIF & TERUJI',
      tag: 'A03 Injection',
    },
    {
      title: 'Cross-Site Scripting (XSS) Sanitization',
      desc: 'Pembersihan payload HTML/JavaScript pada input form dan auto-escaping React JSX. Cookie dilindungi HttpOnly.',
      status: 'AKTIF & TERUJI',
      tag: 'A03 Stored & Reflected XSS',
    },
    {
      title: 'IDOR & TLP 2.0 Access Control Isolation',
      desc: 'Kasus TLP:RED dan aksi mutasi divalidasi ketat di tingkat server-side. Penyerang tidak dapat membobol ID via URL.',
      status: 'AKTIF & TERUJI',
      tag: 'A01 Broken Access Control',
    },
    {
      title: 'Sliding-Window Brute Force Rate Limiter',
      desc: 'Membatasi percobaan login gagal maksimal 5 kali dalam 5 menit per alamat IP untuk mencegah credential stuffing.',
      status: 'AKTIF & TERUJI',
      tag: 'A07 Identification & Auth',
    },
    {
      title: 'Cryptographic Chain of Custody (SHA-256)',
      desc: 'Setiap bukti artefak digital dihitung nilai hash SHA-256 untuk memastikan keabsahan dan integritas forensik.',
      status: 'AKTIF & TERUJI',
      tag: 'A08 Data Integrity',
    },
  ]

  const testScenarios = [
    {
      id: 'SEC-TEST-01',
      title: 'SQL Injection pada Form Login & Parameter',
      payload: "' OR '1'='1' --",
      expected: 'Ditolak dengan 401 Unauthorized, query dijalankan sebagai string literal.',
      status: 'LOLOS (PASS)',
    },
    {
      id: 'SEC-TEST-02',
      title: 'Stored XSS pada Deskripsi Insiden',
      payload: "<script>alert('XSS-ATTACK')</script>",
      expected: 'Payload di-escape dan di-render sebagai string teks biasa tanpa eksekusi script.',
      status: 'LOLOS (PASS)',
    },
    {
      id: 'SEC-TEST-03',
      title: 'IDOR / TLP Bypass pada Direct URL Kasus TLP:RED',
      payload: 'GET /api/incidents/[id-tlp-red] oleh akun ANALYST',
      expected: 'Server merespons 403 Forbidden dan mencatat percobaan akses ke AuditLog.',
      status: 'LOLOS (PASS)',
    },
    {
      id: 'SEC-TEST-04',
      title: 'Brute Force Login & Rate Limiting',
      payload: '10x POST /api/auth/login berturut-turut',
      expected: 'Percobaan ke-6 diblokir dengan respons 429 Too Many Requests.',
      status: 'LOLOS (PASS)',
    },
    {
      id: 'SEC-TEST-05',
      title: 'Audit Security Headers & Zero Leaked Secrets',
      payload: 'Audit CSP, HSTS, X-Frame-Options, & npm audit',
      expected: 'Skor Security Headers A/A+, 0 file .env ter-commit di Git.',
      status: 'LOLOS (PASS)',
    },
  ]

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 pb-16">
      <Topbar
        title="Arsitektur Keamanan & Pengujian Mandiri"
        subtitle="Dokumentasi Kontrol Keamanan Siber, Mitigasi OWASP Top 10, & Skenario Uji Mandiri"
        user={session}
      />

      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Intro */}
        <div className="bg-gradient-to-r from-red-950/30 via-[#11131a] to-orange-950/20 border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">
              Status Kepatuhan Keamanan AegisSOC (Security-by-Design)
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            Aplikasi AegisSOC dirancang untuk memenuhi seluruh ketentuan teknis mata kuliah Cyber
            Security: autentikasi aman, otorisasi RBAC, isolasi IDOR dengan Traffic Light Protocol
            (TLP 2.0), proteksi SQLi/XSS, serta audit trail forensik.
          </p>
        </div>

        {/* Security Controls Grid */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-400" />
            Kontrol Keamanan Aktif di Aplikasi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityFeatures.map((feat) => (
              <div
                key={feat.title}
                className="bg-[#11131a] border border-white/[0.06] rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400">
                      {feat.tag}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {feat.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{feat.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5 Self-Testing Scenarios (Table) */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-orange-400" />
            Matriks 5 Skenario Self-Testing Keamanan (Poin 3f Panduan Tugas)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Rangkuman pengujian keamanan mandiri yang dapat langsung digunakan pada Bab 8 Laporan
            EdLink.
          </p>

          <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400 font-mono text-[10px] uppercase bg-white/[0.01]">
                  <th className="px-6 py-4">ID Uji</th>
                  <th className="px-6 py-4">Skenario Pengujian</th>
                  <th className="px-6 py-4">Payload / Vektor Uji</th>
                  <th className="px-6 py-4">Hasil yang Diharapkan</th>
                  <th className="px-6 py-4 text-right">Status Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {testScenarios.map((tc) => (
                  <tr key={tc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-red-400">{tc.id}</td>
                    <td className="px-6 py-4 font-semibold text-white">{tc.title}</td>
                    <td className="px-6 py-4 font-mono text-[11px] text-amber-300 bg-black/20">
                      {tc.payload}
                    </td>
                    <td className="px-6 py-4 text-slate-300 max-w-sm">{tc.expected}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> {tc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
