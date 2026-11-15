import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { Role } from '@prisma/client'

export interface SessionPayload {
  userId: string
  email: string
  name: string
  role: Role
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'aegissoc-super-secret-jwt-key-change-this-in-production-min-32-chars'
)

export const SESSION_COOKIE_NAME = 'aegissoc_session'
export const SESSION_MAX_AGE = 24 * 60 * 60 // 24 hours in seconds

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}
