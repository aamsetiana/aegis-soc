import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/security/session'
import { createAuditLog } from '@/lib/security/audit'
import { z } from 'zod'
import { AuditAction } from '@prisma/client'

const taskSchema = z.object({
  title: z.string().min(3, 'Judul task minimal 3 karakter').max(255).trim(),
  description: z.string().max(500).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || !['COMMANDER', 'RESPONDER'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  try {
    const body = await request.json()
    const parsed = taskSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validasi task gagal.' }, { status: 400 })
    }

    const task = await prisma.containmentTask.create({
      data: {
        caseId: id,
        title: parsed.data.title,
        description: parsed.data.description,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('[Task POST]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('taskId')

  if (!taskId) {
    return NextResponse.json({ error: 'Parameter taskId wajib diberikan.' }, { status: 400 })
  }

  try {
    const task = await prisma.containmentTask.update({
      where: { id: taskId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        completedById: session.userId,
      },
      include: { completedBy: { select: { name: true } } },
    })

    await createAuditLog({
      action: AuditAction.TASK_COMPLETED,
      userId: session.userId,
      resource: `TASK:${taskId}:INCIDENT:${id}`,
      status: 'SUCCESS',
      details: { title: task.title },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('[Task PATCH]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}
