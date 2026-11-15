import { getSession } from '@/lib/security/session'
import { prisma } from '@/lib/db'
import { Topbar } from '@/components/layout/topbar'
import { getSeverityColor, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Radar, ExternalLink, ShieldAlert, Download } from 'lucide-react'

export default async function IOCTrackerPage() {
  const session = await getSession()
  if (!session) return null

  let iocs: any[] = []
  try {
    iocs = await prisma.iOC.findMany({
      include: {
        case: {
          select: { id: true, caseNumber: true, title: true, tlp: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (e) {
    console.error('Failed to query IOCs:', e)
  }

  // Filter based on TLP access
  const filteredIOCs = iocs.filter((ioc) => {
    if (session.role === 'ANALYST') {
      return ioc.case.tlp === 'GREEN' || ioc.case.tlp === 'WHITE'
    }
    if (session.role === 'RESPONDER') {
      return ioc.case.tlp !== 'RED'
    }
    return true
  })

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 pb-16">
      <Topbar
        title="IOC Threat Intelligence Tracker"
        subtitle={`Katalog Indikator Ancaman Aktif (${filteredIOCs.length} Artefak)`}
        user={session}
        actionButton={{ label: 'Ekspor Feed CSV', href: '/reports' }}
      />

      <div className="p-8 max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Radar className="w-5 h-5 text-red-400" />
              Threat Intelligence Indicators Feed
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Daftar indikator ancaman (IP, Domain, File Hash, URL) yang dikumpulkan dari kasus
              insiden aktif untuk diintegrasikan ke firewall/IDS.
            </p>
          </div>

          <Link
            href="/reports"
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-red-400" /> Unduh Format CSV/STIX
          </Link>
        </div>

        <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400 font-mono text-[10px] uppercase bg-white/[0.01]">
                  <th className="px-6 py-4">Tipe Indikator</th>
                  <th className="px-6 py-4">Nilai IOC (Indicator Value)</th>
                  <th className="px-6 py-4">Tingkat Ancaman</th>
                  <th className="px-6 py-4">Kasus Asal</th>
                  <th className="px-6 py-4">Catatan Intel</th>
                  <th className="px-6 py-4">Waktu Ditemukan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredIOCs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      Belum ada IOC yang terdaftar.
                    </td>
                  </tr>
                ) : (
                  filteredIOCs.map((ioc) => (
                    <tr key={ioc.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-300 font-semibold">
                          {ioc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-red-400 break-all max-w-md">
                        {ioc.value}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getSeverityColor(
                            ioc.threatLevel
                          )}`}
                        >
                          {ioc.threatLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/incidents/${ioc.case.id}`}
                          className="font-mono text-xs text-slate-300 hover:text-white flex items-center gap-1 group"
                        >
                          #{ioc.case.caseNumber}
                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-red-400" />
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                        {ioc.notes || '—'}
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                        {formatDate(ioc.createdAt)}
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
