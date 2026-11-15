import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

const PUBLIC_ROUTES = ['/login', '/register', '/api/auth/login', '/api/auth/register']
const SESSION_COOKIE = 'aegissoc_session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Add security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    // If already logged in and hitting login/register, redirect to dashboard
    const token = request.cookies.get(SESSION_COOKIE)?.value
    if (token && (pathname === '/login' || pathname === '/register')) {
      try {
        await jwtVerify(token, JWT_SECRET)
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } catch {}
    }
    return response
  }

  // Protected routes - check auth
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  try {
    await jwtVerify(token, JWT_SECRET)
    return response
  } catch {
    const url = new URL('/login', request.url)
    url.searchParams.set('expired', '1')
    const redirectResponse = NextResponse.redirect(url)
    redirectResponse.cookies.delete(SESSION_COOKIE)
    return redirectResponse
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}
