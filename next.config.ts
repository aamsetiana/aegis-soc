import type { NextConfig } from 'next'
import { securityHeaders } from './src/lib/security/headers'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  async headers() {
    if (!isProd) {
      return []
    }
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  poweredByHeader: false,
}

export default nextConfig
