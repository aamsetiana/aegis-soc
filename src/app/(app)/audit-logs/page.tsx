import { getSession } from '@/lib/security/session'
import { prisma } from '@/lib/db'
import { getOrSetCache } from '@/lib/cache'
import { Topbar } from '@/components/layout/topbar'
import { formatDate } from '@/lib/utils'
import { Activity, ShieldAlert, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default async function AuditLogsPage() {
  const session = await getSession()
  if (!session) return null

  // Commander can see all audit logs, responder and analyst only see their own or authorized logs
  const where: Record<string, unknown> = {}
  if (session.role !== 'COMMANDER') {
    where.userId = session.userId
  }

  let logs: any[] = []
  try {
    const cacheKey = `audit-logs:${session.role}:${session.userId}`
    logs = await getOrSetCache(cacheKey, 10000, async () => {
      return prisma.auditLog.findMany({
        where,
        include: { user: { select: { name: true, email: true, role: true } } },
        orderBy: { timestamp: 'desc' },
        take: 50,
      })
    })
  } catch (e) {
    console.error('Failed to query audit logs:', e)
  }

  function getStatusBadge(status: string) {
    if (status === 'SUCCESS') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <CheckCircle className="w-3 h-3" /> BERHASIL
        </span>
      )
    }
    if (status === 'BLOCKED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 border border-red-500/30 text-red-400">
          <ShieldAlert className="w-3 h-3" /> DIBLOKIR
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
        <XCircle className="w-3 h-3" /> GAGAL
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 pb-16">
      <Topbar
        title="Jejak Audit Keamanan (Audit Trail)"
        subtitle="Pencatatan Aktivitas Keamanan Tidak Dapat Dimanipulasi (NIST SP 800-61 Rev. 2)"
        user={session}
      />

      <div className="p-8 max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-400" />
              Event Audit Log Real-Time
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {session.role === 'COMMANDER'
                ? 'Seluruh catatan aktivitas autentikasi, mutasi data, dan percobaan serangan IDOR.'
                : 'Catatan aktivitas sesi Anda.'}
            </p>
          </div>
        </div>

        <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400 font-mono text-[10px] uppercase bg-white/[0.01]">
                  <th className="px-6 py-4">Waktu Kejadian</th>
                  <th className="px-6 py-4">Tindakan Keamanan</th>
                  <th className="px-6 py-4">Hasil (Status)</th>
                  <th className="px-6 py-4">Personel Pelaksana</th>
                  <th className="px-6 py-4">Sumber Daya Sasaran</th>
                  <th className="px-6 py-4">Alamat IP Asal</th>
                  <th className="px-6 py-4">Rincian Peristiwa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      Belum ada catatan audit log.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-200">
                        {log.action}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                      <td className="px-6 py-4">
                        {log.user ? (
                          <div>
                            <div className="font-semibold text-white">{log.user.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {log.user.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Anonymous / System</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-300">
                        {log.resource || '—'}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-red-400">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-400 max-w-xs truncate">
                        {log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
