import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/security/password'
import { createAuditLog } from '@/lib/security/audit'
import { registerSchema } from '@/lib/validations'
import { AuditAction, Role } from '@prisma/client'

export async function POST(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1'
  const userAgent = request.headers.get('user-agent') || ''

  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, password, department } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: Role.ANALYST, department },
    })

    await createAuditLog({
      action: AuditAction.REGISTER,
      userId: user.id,
      resource: 'AUTH',
      status: 'SUCCESS',
      details: { email, role: 'ANALYST' },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ success: true, message: 'Akun berhasil dibuat.' }, { status: 201 })
  } catch (error) {
    console.error('[Register API]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}
