import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/security/session'
import { createAuditLog } from '@/lib/security/audit'
import { evidenceSchema } from '@/lib/validations'
import { AuditAction } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || !['COMMANDER', 'RESPONDER'].includes(session.role)) {
    return NextResponse.json(
      { error: 'Hanya peran Commander atau Responder yang dapat menambahkan artefak bukti forensik.' },
      { status: 403 }
    )
  }

  const { id } = await params
  const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1'

  try {
    const incident = await prisma.incidentCase.findUnique({ where: { id } })
    if (!incident) {
      return NextResponse.json({ error: 'Insiden tidak ditemukan.' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = evidenceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi form bukti gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const evidence = await prisma.evidence.create({
      data: {
        caseId: id,
        name: parsed.data.name,
        fileHash: parsed.data.fileHash,
        fileType: parsed.data.fileType,
        fileSize: parsed.data.fileSize,
        sourceDevice: parsed.data.sourceDevice,
        description: parsed.data.description,
        collectedById: session.userId,
      },
    })

    await createAuditLog({
      action: AuditAction.EVIDENCE_ADDED,
      userId: session.userId,
      resource: `EVIDENCE:${evidence.id}:INCIDENT:${id}`,
      status: 'SUCCESS',
      details: {
        name: evidence.name,
        fileHash: evidence.fileHash,
        sourceDevice: evidence.sourceDevice,
      },
      ipAddress,
    })

    return NextResponse.json(evidence, { status: 201 })
  } catch (error) {
    console.error('[Evidence POST]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}
