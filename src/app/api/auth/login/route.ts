import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/security/password'
import { createSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/security/session'
import { checkRateLimit, getRateLimitKey } from '@/lib/security/rate-limit'
import { createAuditLog } from '@/lib/security/audit'
import { loginSchema } from '@/lib/validations'
import { AuditAction } from '@prisma/client'

export async function POST(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
  const userAgent = request.headers.get('user-agent') || ''

  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    // Rate limit check
    const rateLimitKey = getRateLimitKey(ipAddress)
    const rateLimit = checkRateLimit(rateLimitKey)

    if (!rateLimit.allowed) {
      await createAuditLog({
        action: AuditAction.RATE_LIMIT_TRIGGERED,
        resource: 'AUTH',
        status: 'BLOCKED',
        details: { email, reason: 'Rate limit exceeded' },
        ipAddress,
        userAgent,
      })
      return NextResponse.json(
        { error: `Terlalu banyak percobaan login. Coba lagi dalam ${rateLimit.retryAfter} detik.` },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

    if (!user || !user.isActive) {
      await createAuditLog({
        action: AuditAction.LOGIN_FAILED,
        resource: 'AUTH',
        status: 'FAILED',
        details: { email, reason: 'User not found or inactive' },
        ipAddress,
        userAgent,
      })
      return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      await createAuditLog({
        action: AuditAction.LOGIN_FAILED,
        userId: user.id,
        resource: 'AUTH',
        status: 'FAILED',
        details: { email, reason: 'Invalid password' },
        ipAddress,
        userAgent,
      })
      return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 })
    }

    // Create session
    const sessionToken = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    await createAuditLog({
      action: AuditAction.LOGIN_SUCCESS,
      userId: user.id,
      resource: 'AUTH',
      status: 'SUCCESS',
      details: { email },
      ipAddress,
      userAgent,
    })

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[Login API]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}
