import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/security/session'
import { createAuditLog } from '@/lib/security/audit'
import { updateStatusSchema } from '@/lib/validations'
import { AuditAction } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1'

  try {
    const incident = await prisma.incidentCase.findUnique({
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

    if (!incident) {
      return NextResponse.json({ error: 'Insiden tidak ditemukan.' }, { status: 404 })
    }

    // STRICT IDOR & TLP 2.0 ACCESS CONTROL MATRIX:
    // - COMMANDER can access all TLP
    // - TLP:RED can ONLY be accessed by COMMANDER, Reporter, or Assigned Responder
    // - TLP:AMBER can only be accessed by COMMANDER or RESPONDER
    // - TLP:GREEN & WHITE can be accessed by all authenticated users
    const hasAccess =
      session.role === 'COMMANDER' ||
      (incident.tlp === 'RED' &&
        (incident.assignedToId === session.userId || incident.reportedById === session.userId)) ||
      (incident.tlp === 'AMBER' && ['COMMANDER', 'RESPONDER'].includes(session.role)) ||
      incident.tlp === 'GREEN' ||
      incident.tlp === 'WHITE'

    if (!hasAccess) {
      await createAuditLog({
        action: AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT,
        userId: session.userId,
        resource: `INCIDENT:${id}`,
        status: 'BLOCKED',
        details: {
          tlp: incident.tlp,
          userRole: session.role,
          reason: 'Attempted unauthorized IDOR/TLP access to protected case',
        },
        ipAddress,
      })

      return NextResponse.json(
        {
          error: `Akses Ditolak: Anda tidak memiliki otorisasi untuk melihat kasus dengan klasifikasi TLP:${incident.tlp}.`,
          code: 'TLP_ACCESS_DENIED',
        },
        { status: 403 }
      )
    }

    return NextResponse.json(incident)
  } catch (error) {
    console.error('[Incident GET]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!['COMMANDER', 'RESPONDER'].includes(session.role)) {
    return NextResponse.json(
      { error: 'Hanya peran Commander atau Responder yang dapat memperbarui status insiden.' },
      { status: 403 }
    )
  }

  const { id } = await params
  const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1'

  try {
    const body = await request.json()
    const parsed = updateStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 })
    }

    const existing = await prisma.incidentCase.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Insiden tidak ditemukan.' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = { status: parsed.data.status }
    if (parsed.data.status === 'CONTAINED' && !existing.containedAt) {
      updateData.containedAt = new Date()
    }
    if (parsed.data.status === 'ERADICATED' && !existing.eradicatedAt) {
      updateData.eradicatedAt = new Date()
    }
    if (parsed.data.status === 'CLOSED' && !existing.closedAt) {
      updateData.closedAt = new Date()
    }

    const updated = await prisma.incidentCase.update({
      where: { id },
      data: updateData,
    })

    await createAuditLog({
      action: AuditAction.INCIDENT_STATUS_CHANGED,
      userId: session.userId,
      resource: `INCIDENT:${id}`,
      status: 'SUCCESS',
      details: { from: existing.status, to: parsed.data.status },
      ipAddress,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[Incident PATCH]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'COMMANDER') {
    return NextResponse.json(
      { error: 'Hanya Commander yang memiliki wewenang menghapus kasus insiden.' },
      { status: 403 }
    )
  }

  const { id } = await params
  const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1'

  try {
    const existing = await prisma.incidentCase.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Insiden tidak ditemukan.' }, { status: 404 })
    }

    await prisma.incidentCase.delete({ where: { id } })

    await createAuditLog({
      action: AuditAction.INCIDENT_DELETED,
      userId: session.userId,
      resource: `INCIDENT:${id}`,
      status: 'SUCCESS',
      details: { caseNumber: existing.caseNumber, title: existing.title },
      ipAddress,
    })

    return NextResponse.json({ success: true, message: 'Insiden berhasil dihapus.' })
  } catch (error) {
    console.error('[Incident DELETE]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}
