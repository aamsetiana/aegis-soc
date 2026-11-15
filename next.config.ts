import type { NextConfig } from 'next'
import { securityHeaders } from './src/lib/security/headers'

const nextConfig: NextConfig = {
  async headers() {
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
