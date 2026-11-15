import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/security/session'
import { createAuditLog } from '@/lib/security/audit'
import { AuditAction } from '@prisma/client'
import { SESSION_COOKIE_NAME } from '@/lib/security/session'

export async function POST(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1'
  const session = await getSession()

  if (session) {
    await createAuditLog({
      action: AuditAction.LOGOUT,
      userId: session.userId,
      resource: 'AUTH',
      status: 'SUCCESS',
      ipAddress,
    })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete(SESSION_COOKIE_NAME)
  return response
}
