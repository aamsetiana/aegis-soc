import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/security/session'
import { createAuditLog } from '@/lib/security/audit'
import { incidentSchema } from '@/lib/validations'
import { generateCaseNumber } from '@/lib/utils'
import { AuditAction } from '@prisma/client'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const severity = searchParams.get('severity')

  const where: Record<string, unknown> = {}
  if (status && status !== 'ALL') where.status = status
  if (severity && severity !== 'ALL') where.severity = severity

  // TLP Access Control
  if (session.role === 'ANALYST') where.tlp = { in: ['GREEN', 'WHITE'] }
  else if (session.role === 'RESPONDER') where.tlp = { in: ['GREEN', 'WHITE', 'AMBER'] }

  try {
    const incidents = await prisma.incidentCase.findMany({
      where,
      include: {
        reportedBy: { select: { name: true, email: true } },
        assignedTo: { select: { name: true } },
        _count: { select: { iocs: true, evidence: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(incidents)
  } catch (error) {
    console.error('[Incidents GET]', error)
    return NextResponse.json({ error: 'Gagal mengambil data insiden.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ipAddress =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
  const userAgent = request.headers.get('user-agent') || ''

  try {
    const body = await request.json()
    const parsed = incidentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi form gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { title, description, category, severity, tlp, affectedSystems, assignedToId } =
      parsed.data
    const caseNumber = generateCaseNumber()

    const incident = await prisma.incidentCase.create({
      data: {
        caseNumber,
        title,
        description,
        category: category as any,
        severity: severity as any,
        tlp: tlp as any,
        affectedSystems,
        reportedById: session.userId,
        assignedToId: assignedToId || null,
      },
    })

    await createAuditLog({
      action: AuditAction.INCIDENT_CREATED,
      userId: session.userId,
      resource: `INCIDENT:${incident.id}`,
      status: 'SUCCESS',
      details: { caseNumber, title, severity, tlp },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ id: incident.id, caseNumber: incident.caseNumber }, { status: 201 })
  } catch (error) {
    console.error('[Incidents POST]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}
