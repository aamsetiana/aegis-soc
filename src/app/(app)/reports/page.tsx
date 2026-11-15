import { getSession } from '@/lib/security/session'
import { prisma } from '@/lib/db'
import { Topbar } from '@/components/layout/topbar'
import { ReportGeneratorClient } from '@/components/reports/report-generator-client'

export default async function ReportsPage() {
  const session = await getSession()
  if (!session) return null

  let incidents: any[] = []
  let iocs: any[] = []

  try {
    incidents = await prisma.incidentCase.findMany({
      include: {
        reportedBy: { select: { name: true } },
        assignedTo: { select: { name: true } },
        _count: { select: { iocs: true, evidence: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    iocs = await prisma.iOC.findMany({
      include: { case: { select: { caseNumber: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    })
  } catch (e) {
    console.error('Failed to load reports data:', e)
  }

  const serializedIncidents = JSON.parse(JSON.stringify(incidents))
  const serializedIocs = JSON.parse(JSON.stringify(iocs))

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 pb-16">
      <Topbar
        title="Security Reports & Export Center"
        subtitle="Ekspor Laporan Rekapitulasi Insiden Eksekutif (PDF) & Threat Intel Feed (CSV)"
        user={session}
      />

      <div className="p-8 max-w-[1600px] mx-auto space-y-6">
        <ReportGeneratorClient
          incidents={serializedIncidents}
          iocs={serializedIocs}
          userName={session.name}
          userRole={session.role}
        />
      </div>
    </div>
  )
}
