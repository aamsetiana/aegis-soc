import { getSession } from '@/lib/security/session'
import { prisma } from '@/lib/db'
import { getOrSetCache } from '@/lib/cache'
import { Topbar } from '@/components/layout/topbar'
import { formatDate } from '@/lib/utils'
import { Users, ShieldCheck, UserCheck, ShieldAlert, Key } from 'lucide-react'

export default async function TeamPage() {
  const session = await getSession()
  if (!session) return null

  let users: any[] = []
  try {
    users = await getOrSetCache('users:all', 30000, async () => {
      return prisma.user.findMany({
        include: {
          _count: { select: { reportedIncidents: true, assignedIncidents: true } },
        },
        orderBy: { createdAt: 'asc' },
      })
    })
  } catch (e) {
    console.error('Failed to query users:', e)
  }

  const roleBadges: Record<string, { label: string; color: string; icon: any }> = {
    COMMANDER: {
      label: 'Komandan Insiden Siber (Administrator)',
      color: 'bg-red-500/10 border-red-500/30 text-red-400',
      icon: ShieldAlert,
    },
    RESPONDER: {
      label: 'Petugas Respons & Forensik Insiden',
      color: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      icon: ShieldCheck,
    },
    ANALYST: {
      label: 'Analis Triage Keamanan Tingkat 1',
      color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      icon: UserCheck,
    },
  }

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 pb-16">
      <Topbar
        title="Struktur Tim & Hak Akses (RBAC)"
        subtitle="Matriks Hak Akses Berdasarkan Peran & Kepatuhan Prinsip Least Privilege"
        user={session}
      />

      <div className="p-8 max-w-[1600px] mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-red-400" />
            Personel Security Operations Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Daftar akun pengujian dan personel yang terdaftar di dalam platform AegisSOC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {users.map((u) => {
            const roleInfo = roleBadges[u.role] || roleBadges.ANALYST
            const Icon = roleInfo.icon

            return (
              <div
                key={u.id}
                className="bg-[#11131a] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600/30 via-red-800/30 to-orange-600/30 border border-red-500/30 flex items-center justify-center text-white font-extrabold text-base">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${roleInfo.color}`}
                    >
                      <Icon className="w-3 h-3" />
                      {u.role}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white group-hover:text-red-400 transition-colors">
                    {u.name}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{u.email}</div>
                  <div className="text-xs text-slate-500 mt-2">
                    Departemen: <span className="text-slate-300">{u.department || 'SOC'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>Kasus Dilaporkan: {u._count.reportedIncidents}</span>
                  <span>Ditugaskan: {u._count.assignedIncidents}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
