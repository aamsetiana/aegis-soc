import { getSession } from '@/lib/security/session'
import { prisma } from '@/lib/db'
import { getOrSetCache } from '@/lib/cache'
import { Topbar } from '@/components/layout/topbar'
import {
  getSeverityColor,
  getTLPColor,
  getStatusColor,
  getCategoryLabel,
  getStatusLabel,
  getSeverityLabel,
  formatDate,
} from '@/lib/utils'
import Link from 'next/link'
import { Plus, ShieldAlert, Filter, Search } from 'lucide-react'
import { TLP, Severity, IncidentStatus } from '@prisma/client'

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; severity?: string; tlp?: string; search?: string }>
}) {
  const session = await getSession()
  if (!session) return null

  const params = await searchParams
  const { status, severity, tlp, search } = params

  // Build filter based on user role and TLP access (IDOR & TLP Protection)
  const baseWhere: Record<string, unknown> = {}
  if (status && status !== 'ALL') baseWhere.status = status
  if (severity && severity !== 'ALL') baseWhere.severity = severity

  // TLP Access Isolation:
  // - ANALYST only sees GREEN & WHITE
  // - RESPONDER sees GREEN, WHITE, & AMBER
  // - COMMANDER sees all (RED, AMBER, GREEN, WHITE)
  if (session.role === 'ANALYST') {
    baseWhere.tlp = { in: ['GREEN', 'WHITE'] as TLP[] }
  } else if (session.role === 'RESPONDER') {
    baseWhere.tlp = { in: ['GREEN', 'WHITE', 'AMBER'] as TLP[] }
  }

  if (tlp && tlp !== 'ALL' && session.role !== 'ANALYST') {
    baseWhere.tlp = tlp
  }

  if (search) {
    baseWhere.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { caseNumber: { contains: search, mode: 'insensitive' } },
      { affectedSystems: { contains: search, mode: 'insensitive' } },
    ]
  }

  let incidents: any[] = []
  try {
    const cacheKey = `incidents:${session.role}:${status || 'ALL'}:${severity || 'ALL'}:${tlp || 'ALL'}:${search || ''}`
    incidents = await getOrSetCache(cacheKey, 15000, async () => {
      return prisma.incidentCase.findMany({
        where: baseWhere,
        include: {
          reportedBy: { select: { name: true, role: true } },
          assignedTo: { select: { name: true } },
          _count: { select: { iocs: true, evidence: true, containmentTasks: true } },
        },
        orderBy: [{ createdAt: 'desc' }],
      })
    })
  } catch (e) {
    console.error('Failed to query incidents:', e)
  }

  const canCreate = ['COMMANDER', 'RESPONDER', 'ANALYST'].includes(session.role)

  const statusTabs: { key: string; label: string }[] = [
    { key: 'ALL', label: 'Semua Status' },
    { key: 'NEW', label: 'Baru' },
    { key: 'TRIAGED', label: 'Ditelaah' },
    { key: 'CONTAINED', label: 'Terkendali' },
    { key: 'ERADICATED', label: 'Dibasmi' },
    { key: 'CLOSED', label: 'Selesai' },
  ]

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 pb-12">
      <Topbar
        title="Daftar Kasus Insiden Keamanan"
        subtitle={`Total ${incidents.length} kasus insiden terdaftar di sistem`}
        user={session}
        actionButton={{ label: 'Laporkan Insiden', href: '/incidents/new' }}
      />

      <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Actions & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {statusTabs.map((s) => (
              <Link
                key={s.key}
                href={s.key === 'ALL' ? '/incidents' : `/incidents?status=${s.key}`}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                  (!status && s.key === 'ALL') || status === s.key
                    ? 'bg-red-500/15 border-red-500/30 text-red-400 font-semibold'
                    : 'border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {canCreate && (
              <Link
                href="/incidents/new"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20 transition-all"
              >
                <Plus className="w-4 h-4" /> Laporkan Insiden Baru
              </Link>
            )}
          </div>
        </div>

        {/* Incidents Table */}
        <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400 font-mono text-[11px] uppercase tracking-wider bg-white/[0.01]">
                  <th className="px-6 py-4">No. Kasus</th>
                  <th className="px-6 py-4">Judul Kasus & Sistem</th>
                  <th className="px-6 py-4">Kategori Ancaman</th>
                  <th className="px-6 py-4">Tingkat Keparahan</th>
                  <th className="px-6 py-4">Klasifikasi TLP</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Artefak / IOC</th>
                  <th className="px-6 py-4">Petugas Investigasi</th>
                  <th className="px-6 py-4">Waktu Registrasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-slate-500">
                      <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      Tidak ada kasus insiden yang sesuai filter atau izin akses Anda.
                    </td>
                  </tr>
                ) : (
                  incidents.map((inc) => (
                    <tr
                      key={inc.id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/incidents/${inc.id}`}
                          className="font-mono text-red-400 group-hover:underline font-semibold"
                        >
                          #{inc.caseNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 max-w-sm">
                        <Link
                          href={`/incidents/${inc.id}`}
                          className="text-slate-100 hover:text-white font-medium truncate block"
                        >
                          {inc.title}
                        </Link>
                        {inc.affectedSystems && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                            {inc.affectedSystems}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300 font-medium">
                          {getCategoryLabel(inc.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getSeverityColor(
                            inc.severity
                          )}`}
                        >
                          {getSeverityLabel(inc.severity)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${getTLPColor(
                            inc.tlp
                          )}`}
                        >
                          TLP:{inc.tlp}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(
                            inc.status
                          )}`}
                        >
                          {getStatusLabel(inc.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400 text-[11px]">
                        <span>{inc._count.iocs} IOC</span> •{' '}
                        <span>{inc._count.evidence} Artefak</span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {inc.assignedTo?.name || (
                          <span className="text-slate-500 italic">Belum Ditugaskan</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-[11px] font-mono">
                        {formatDate(inc.createdAt)}
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
