'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { MoreVertical } from 'lucide-react'

// Trend mock data for "Breakdown" wavy chart
const breakdownData = [
  { time: '00:00', inbound: 42, outbound: 28 },
  { time: '04:00', inbound: 68, outbound: 45 },
  { time: '08:00', inbound: 95, outbound: 62 },
  { time: '12:00', inbound: 130, outbound: 85 },
  { time: '16:00', inbound: 110, outbound: 78 },
  { time: '20:00', inbound: 85, outbound: 52 },
  { time: '23:59', inbound: 60, outbound: 38 },
]

// Alert Volume grouped bars
const alertVolumeData = [
  { day: 'Sen', critical: 12, high: 24, badge: '+12%' },
  { day: 'Sel', critical: 18, high: 32, badge: '+45%' },
  { day: 'Rab', critical: 25, high: 45, badge: '+20%' },
  { day: 'Kam', critical: 15, high: 28, badge: '+8%' },
  { day: 'Jum', critical: 22, high: 38, badge: '+30%' },
]

// Operations dense timeline
const operationsData = Array.from({ length: 28 }, (_, i) => ({
  point: i,
  ops: Math.floor(Math.sin(i / 3) * 20 + 40 + (i % 5) * 8),
}))

export function DashboardCharts({
  categoryStats,
  severityStats,
}: {
  categoryStats: { category: string; _count: { id: number } }[]
  severityStats: { severity: string; _count: { id: number } }[]
}) {
  return (
    <div className="space-y-5">
      {/* Row 2 from Reference Image: Breakdown, Alert Volume, Firewall Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Breakdown (Wavy curves) */}
        <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Analisis Lalu Lintas (Breakdown)</h3>
              <p className="text-[11px] text-slate-400">Trafik deteksi masuk vs tertahan</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400">
                +68%
              </span>
              <button className="text-slate-500 hover:text-slate-300">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="h-44 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={breakdownData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="glowOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="glowPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any, name: any) => [val, name === 'inbound' ? 'Deteksi Masuk' : 'Dicegah / Filter']}
                  contentStyle={{
                    backgroundColor: '#0d0f14',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="inbound" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#glowOrange)" name="Deteksi Masuk" />
                <Area type="monotone" dataKey="outbound" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#glowPurple)" name="Dicegah / Filter" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Alert Volume (Grouped bars like reference) */}
        <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Volume Ancaman (Alert Volume)</h3>
              <p className="text-[11px] text-slate-400">Volume ancaman mingguan (Kritis & Tinggi)</p>
            </div>
            <button className="text-slate-500 hover:text-slate-300">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="h-44 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertVolumeData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }} barGap={6}>
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d0f14',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="critical" fill="#ef4444" radius={[6, 6, 0, 0]} name="Kritis" />
                <Bar dataKey="high" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Tinggi" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Firewall Activity (Semi-Gauge from reference image) */}
        <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Aktivitas Firewall (Firewall Activity)</h3>
              <p className="text-[11px] text-slate-400 font-mono">14,325 pemeriksaan aturan/detik</p>
            </div>
            <button className="text-slate-500 hover:text-slate-300">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* SVG Gauge Needle & Arc */}
          <div className="flex flex-col items-center justify-center my-auto py-2">
            <div className="relative w-48 h-28 flex items-end justify-center">
              <svg className="w-48 h-28 overflow-visible" viewBox="0 0 100 55">
                {/* Background arc */}
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#1f2430"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Active gradient arc (21%) */}
                <path
                  d="M 10 50 A 40 40 0 0 1 45 13"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="125"
                  strokeDashoffset="35"
                />
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ff453a" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute bottom-0 flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white tracking-tight">21%</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">Beban Aktif</span>
              </div>
            </div>

            {/* Scale indicators */}
            <div className="flex justify-between w-44 text-[10px] text-slate-500 font-mono mt-1 px-1">
              <span>10%</span>
              <span>15%</span>
              <span>20%</span>
              <span>25%</span>
              <span>30%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
