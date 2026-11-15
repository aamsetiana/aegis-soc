import { redirect } from 'next/navigation'
import { getSession } from '@/lib/security/session'
import { Sidebar } from '@/components/layout/sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#08090d]">
      <Sidebar user={session} />
      <main className="flex-1 ml-64 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
