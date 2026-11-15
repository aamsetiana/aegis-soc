import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/security/session'
import { createAuditLog } from '@/lib/security/audit'
import { iocSchema } from '@/lib/validations'
import { AuditAction } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1'

  try {
    const incident = await prisma.incidentCase.findUnique({ where: { id } })
    if (!incident) {
      return NextResponse.json({ error: 'Insiden tidak ditemukan.' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = iocSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi IOC gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const ioc = await prisma.iOC.create({
      data: {
        caseId: id,
        type: parsed.data.type as any,
        value: parsed.data.value,
        threatLevel: parsed.data.threatLevel as any,
        notes: parsed.data.notes,
      },
    })

    await createAuditLog({
      action: AuditAction.IOC_ADDED,
      userId: session.userId,
      resource: `IOC:${ioc.id}:INCIDENT:${id}`,
      status: 'SUCCESS',
      details: { type: ioc.type, value: ioc.value, threatLevel: ioc.threatLevel },
      ipAddress,
    })

    return NextResponse.json(ioc, { status: 201 })
  } catch (error) {
    console.error('[IOC POST]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || !['COMMANDER', 'RESPONDER'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const iocId = searchParams.get('iocId')

  if (!iocId) {
    return NextResponse.json({ error: 'Parameter iocId wajib diberikan.' }, { status: 400 })
  }

  try {
    await prisma.iOC.delete({ where: { id: iocId } })

    await createAuditLog({
      action: AuditAction.IOC_DELETED,
      userId: session.userId,
      resource: `IOC:${iocId}:INCIDENT:${id}`,
      status: 'SUCCESS',
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[IOC DELETE]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}
