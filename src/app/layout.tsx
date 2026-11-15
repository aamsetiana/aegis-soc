import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'AegisSOC — Platform Respons Insiden Keamanan Siber',
  description: 'Platform Manajemen Kasus Pusat Operasi Keamanan (SOC) Terintegrasi',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className={`${poppins.variable} ${poppins.className} bg-[#0a0a0f] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
