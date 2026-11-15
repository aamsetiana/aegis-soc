import { getSession } from '@/lib/security/session'
import { prisma } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import { createAuditLog } from '@/lib/security/audit'
import { AuditAction } from '@prisma/client'
import { CaseDossierClient } from '@/components/incidents/case-dossier-client'
import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  if (!session) redirect('/login')

  let incident: any = null
  try {
    incident = await prisma.incidentCase.findUnique({
      where: { id },
      include: {
        reportedBy: { select: { id: true, name: true, email: true, role: true } },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        iocs: { orderBy: { createdAt: 'desc' } },
        evidence: {
          include: { collectedBy: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        containmentTasks: {
          include: { completedBy: { select: { name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  } catch (error) {
    console.error('Error fetching incident:', error)
  }

  if (!incident) notFound()

  // TLP Access Control (Security IDOR Prevention Layer)
  const hasAccess =
    session.role === 'COMMANDER' ||
    (incident.tlp === 'RED' &&
      (session.userId === incident.reportedById || session.userId === incident.assignedToId)) ||
    (incident.tlp === 'AMBER' && ['COMMANDER', 'RESPONDER'].includes(session.role)) ||
    incident.tlp === 'GREEN' ||
    incident.tlp === 'WHITE'

  if (!hasAccess) {
    // Record unauthorized access attempt in audit log
    await createAuditLog({
      action: AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT,
      userId: session.userId,
      resource: `INCIDENT:${id}`,
      status: 'BLOCKED',
      details: {
        tlp: incident.tlp,
        role: session.role,
        reason: 'IDOR blocked: Attempted direct URL access to restricted TLP case',
      },
    })

    return (
      <div className="min-h-screen bg-[#08090d] flex items-center justify-center p-6">
        <div className="bg-[#11131a] border border-red-500/30 rounded-2xl p-8 max-w-lg text-center shadow-2xl shadow-red-500/10">
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-5 text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 mb-3">
            AKSES DITOLAK — TLP:{incident.tlp}
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Restricted Security Clearance</h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            Kasus #{incident.caseNumber} diklasifikasikan sebagai{' '}
            <strong className="text-red-400">TLP:{incident.tlp}</strong>. Berdasarkan kebijakan
            kontrol akses (RBAC) dan Traffic Light Protocol NIST SP 800-61, peran akun Anda (
            <span className="font-mono text-white">{session.role}</span>) tidak memiliki wewenang
            untuk membuka rekaman ini.
          </p>
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-[11px] font-mono text-slate-500 mb-6">
            Security Event Logged: IDOR_PREVENTION_BLOCKED
          </div>
          <Link
            href="/incidents"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kasus
          </Link>
        </div>
      </div>
    )
  }

  const serializedIncident = JSON.parse(JSON.stringify(incident))
  const serializedSession = JSON.parse(JSON.stringify(session))

  return <CaseDossierClient incident={serializedIncident} session={serializedSession} />
}
