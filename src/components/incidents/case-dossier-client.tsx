'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Plus,
  CheckCircle,
  Circle,
  Trash2,
  Database,
  Lock,
  Loader2,
  Eye,
  FileCheck2,
  Calendar,
  Layers,
  Fingerprint,
} from 'lucide-react'
import {
  getSeverityColor,
  getTLPColor,
  getStatusColor,
  getCategoryLabel,
  formatDate,
  calculateMTTR,
} from '@/lib/utils'

const statusOptions = ['NEW', 'TRIAGED', 'CONTAINED', 'ERADICATED', 'CLOSED']
const statusLabels: Record<string, string> = {
  NEW: 'Baru (New)',
  TRIAGED: 'Ditelaah (Triaged)',
  CONTAINED: 'Terkendali (Contained)',
  ERADICATED: 'Dibasmi (Eradicated)',
  CLOSED: 'Selesai (Closed)',
}

const iocTypes = [
  'IP_ADDRESS',
  'DOMAIN',
  'URL',
  'MD5_HASH',
  'SHA256_HASH',
  'EMAIL',
  'FILE_NAME',
]
const iocTypeLabels: Record<string, string> = {
  IP_ADDRESS: 'Alamat IP',
  DOMAIN: 'Nama Domain',
  URL: 'Tautan URL',
  MD5_HASH: 'Hash MD5',
  SHA256_HASH: 'Hash SHA-256',
  EMAIL: 'Alamat Email',
  FILE_NAME: 'Nama Berkas',
}

export function CaseDossierClient({
  incident: initialIncident,
  session,
}: {
  incident: any
  session: any
}) {
  const [incident, setIncident] = useState(initialIncident)
  const [activeTab, setActiveTab] = useState<'overview' | 'ioc' | 'evidence' | 'tasks'>('overview')
  const [iocForm, setIocForm] = useState({
    type: 'IP_ADDRESS',
    value: '',
    threatLevel: 'HIGH',
    notes: '',
  })
  const [evidenceForm, setEvidenceForm] = useState({
    name: '',
    fileHash: '',
    fileType: 'application/octet-stream',
    sourceDevice: '',
    description: '',
  })
  const [taskForm, setTaskForm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const canEdit = ['COMMANDER', 'RESPONDER'].includes(session.role)

  async function updateStatus(newStatus: string) {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/incidents/${incident.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const updated = await res.json()
        setIncident({ ...incident, ...updated })
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function addIOC(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/incidents/${incident.id}/iocs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(iocForm),
      })
      if (res.ok) {
        const newIoc = await res.json()
        setIncident({ ...incident, iocs: [newIoc, ...incident.iocs] })
        setIocForm({ type: 'IP_ADDRESS', value: '', threatLevel: 'HIGH', notes: '' })
      } else {
        const d = await res.json()
        setError(d.error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteIOC(iocId: string) {
    if (!confirm('Hapus indikator ancaman ini?')) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/incidents/${incident.id}/iocs?iocId=${iocId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setIncident({
          ...incident,
          iocs: incident.iocs.filter((i: any) => i.id !== iocId),
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function addEvidence(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch(`/api/incidents/${incident.id}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evidenceForm),
      })
      if (res.ok) {
        const newEv = await res.json()
        setIncident({ ...incident, evidence: [newEv, ...incident.evidence] })
        setEvidenceForm({
          name: '',
          fileHash: '',
          fileType: 'application/octet-stream',
          sourceDevice: '',
          description: '',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function completeTask(taskId: string) {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/incidents/${incident.id}/tasks?taskId=${taskId}`, {
        method: 'PATCH',
      })
      if (res.ok) {
        setIncident({
          ...incident,
          containmentTasks: incident.containmentTasks.map((t: any) =>
            t.id === taskId
              ? {
                  ...t,
                  isCompleted: true,
                  completedAt: new Date().toISOString(),
                  completedBy: { name: session.name },
                }
              : t
          ),
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!taskForm.trim()) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/incidents/${incident.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: taskForm }),
      })
      if (res.ok) {
        const newTask = await res.json()
        setIncident({
          ...incident,
          containmentTasks: [...incident.containmentTasks, newTask],
        })
        setTaskForm('')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-red-500/50 transition-all'
  const selectClass =
    'px-3.5 py-2.5 rounded-xl bg-[#11131a] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-red-500/50 transition-all'

  const tabs = [
    { id: 'overview', label: 'Ringkasan Kasus', icon: Eye },
    { id: 'ioc', label: `Indikator Ancaman (IOC) (${incident.iocs.length})`, icon: AlertTriangle },
    { id: 'evidence', label: `Gudang Bukti Forensik (${incident.evidence.length})`, icon: Database },
    {
      id: 'tasks',
      label: `Tugas Penanganan (${
        incident.containmentTasks.filter((t: any) => !t.isCompleted).length
      } aktif)`,
      icon: CheckCircle,
    },
  ]

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 pb-16">
      {/* Header Case Dossier */}
      <div className="border-b border-white/[0.06] px-8 py-5 bg-[#0b0c10]/80 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link
              href="/incidents"
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all mt-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-md">
                  #{incident.caseNumber}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${getTLPColor(
                    incident.tlp
                  )}`}
                >
                  TLP:{incident.tlp}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getSeverityColor(
                    incident.severity
                  )}`}
                >
                  {incident.severity}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(
                    incident.status
                  )}`}
                >
                  {incident.status}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{incident.title}</h1>
              <p className="text-xs text-slate-400 mt-1">
                Kategori: <strong className="text-slate-200">{getCategoryLabel(incident.category)}</strong> •
                Dilaporkan oleh {incident.reportedBy?.name} • Terdeteksi {formatDate(incident.detectedAt)}
              </p>
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400">Status Siklus:</label>
              <select
                value={incident.status}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={isLoading}
                className={selectClass}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s] || s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-white/[0.06] px-8 bg-[#0b0c10]/40">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-8 max-w-[1600px] mx-auto">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Kronologi & Rincian Investigasi
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {incident.description}
                </p>
              </div>

              {incident.affectedSystems && (
                <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-orange-400" />
                    Sistem & Aset Terdampak
                  </h3>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] font-mono text-xs text-slate-300">
                    {incident.affectedSystems}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Meta Info */}
            <div className="space-y-6">
              <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white">Metadata Penanganan</h3>
                {[
                  { label: 'Pelapor Deteksi', value: incident.reportedBy?.name },
                  {
                    label: 'Investigator Bertugas',
                    value: incident.assignedTo?.name || 'Belum Ditugaskan',
                  },
                  { label: 'Waktu Deteksi', value: formatDate(incident.detectedAt) },
                  {
                    label: 'Waktu Containment',
                    value: incident.containedAt ? formatDate(incident.containedAt) : 'Belum selesai',
                  },
                  {
                    label: 'Waktu Selesai (Closed)',
                    value: incident.closedAt ? formatDate(incident.closedAt) : 'Masih aktif',
                  },
                  {
                    label: 'Estimasi Durasi (MTTR)',
                    value: calculateMTTR(incident.detectedAt, incident.closedAt),
                  },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-start text-xs">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-slate-200 font-medium text-right max-w-[55%]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-red-400" />
                  <span className="font-semibold text-white text-xs">Kebijakan Kerahasiaan TLP</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Kasus ini dilindungi oleh otorisasi TLP:{incident.tlp}. Akses langsung oleh peran
                  yang tidak memiliki izin akan segera diblokir dan dicatat ke dalam audit log.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: IOC */}
        {activeTab === 'ioc' && (
          <div className="space-y-6">
            {canEdit && (
              <form
                onSubmit={addIOC}
                className="bg-[#11131a] border border-white/[0.06] rounded-2xl p-6"
              >
                <h3 className="text-sm font-semibold text-white mb-2">
                  Tambah Indikator Ancaman (IOC)
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Daftarkan alamat IP penyerang, domain C2, atau hash berkas berbahaya yang
                  teridentifikasi.
                </p>

                {error && (
                  <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                  <select
                    value={iocForm.type}
                    onChange={(e) => setIocForm({ ...iocForm, type: e.target.value })}
                    className={selectClass}
                  >
                    {iocTypes.map((t) => (
                      <option key={t} value={t}>
                        {iocTypeLabels[t]}
                      </option>
                    ))}
                  </select>

                  <select
                    value={iocForm.threatLevel}
                    onChange={(e) => setIocForm({ ...iocForm, threatLevel: e.target.value })}
                    className={selectClass}
                  >
                    {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <input
                    value={iocForm.value}
                    onChange={(e) => setIocForm({ ...iocForm, value: e.target.value })}
                    placeholder="Nilai IOC (contoh: 185.220.101.5 atau bad-domain.ru)..."
                    required
                    className={inputClass}
                  />

                  <input
                    value={iocForm.notes}
                    onChange={(e) => setIocForm({ ...iocForm, notes: e.target.value })}
                    placeholder="Catatan / Vektor infeksi..."
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Simpan Indikator Ancaman
                </button>
              </form>
            )}

            <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white">
                  Daftar IOC Terkait ({incident.iocs.length})
                </h3>
              </div>

              {incident.iocs.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  Belum ada indikator ancaman (IOC) yang dicatat untuk kasus ini.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {incident.iocs.map((ioc: any) => (
                    <div
                      key={ioc.id}
                      className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-400 flex-shrink-0">
                          {iocTypeLabels[ioc.type] || ioc.type}
                        </span>
                        <span className="font-mono text-xs text-red-400 break-all font-semibold">
                          {ioc.value}
                        </span>
                        {ioc.notes && (
                          <span className="text-xs text-slate-400 italic truncate hidden lg:inline">
                            — {ioc.notes}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getSeverityColor(
                            ioc.threatLevel
                          )}`}
                        >
                          {ioc.threatLevel}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {formatDate(ioc.createdAt)}
                        </span>
                        {canEdit && (
                          <button
                            onClick={() => deleteIOC(ioc.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Hapus IOC"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Evidence */}
        {activeTab === 'evidence' && (
          <div className="space-y-6">
            {canEdit && (
              <form
                onSubmit={addEvidence}
                className="bg-[#11131a] border border-white/[0.06] rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Evidence Vault — Chain of Custody Forensik
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Daftarkan berkas barang bukti digital. Nilai SHA-256 dicatat secara permanen untuk
                  menjamin integritas bukti di pengadilan/audit forensik.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <input
                    value={evidenceForm.name}
                    onChange={(e) => setEvidenceForm({ ...evidenceForm, name: e.target.value })}
                    placeholder="Nama artefak (contoh: dump_memory.raw atau trojan_sample.exe)..."
                    required
                    className={inputClass}
                  />
                  <input
                    value={evidenceForm.sourceDevice}
                    onChange={(e) =>
                      setEvidenceForm({ ...evidenceForm, sourceDevice: e.target.value })
                    }
                    placeholder="Perangkat / Host Sumber (contoh: WS-FINANCE-01)..."
                    required
                    className={inputClass}
                  />
                  <input
                    value={evidenceForm.fileHash}
                    onChange={(e) => setEvidenceForm({ ...evidenceForm, fileHash: e.target.value })}
                    placeholder="Kalkulasi Nilai SHA-256 Hash Artefak (64 karakter heksadesimal)..."
                    required
                    className={inputClass + ' font-mono text-xs col-span-2'}
                  />
                  <input
                    value={evidenceForm.fileType}
                    onChange={(e) => setEvidenceForm({ ...evidenceForm, fileType: e.target.value })}
                    placeholder="Tipe Berkas / MIME..."
                    className={inputClass}
                  />
                  <input
                    value={evidenceForm.description}
                    onChange={(e) =>
                      setEvidenceForm({ ...evidenceForm, description: e.target.value })
                    }
                    placeholder="Konteks ekstraksi bukti..."
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Database className="w-4 h-4" /> Simpan Artefak ke Vault
                </button>
              </form>
            )}

            <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white">
                  Evidence Locker Records ({incident.evidence.length})
                </h3>
              </div>

              {incident.evidence.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  Belum ada barang bukti forensik yang dicatat.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {incident.evidence.map((ev: any) => (
                    <div key={ev.id} className="p-6 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm text-white">{ev.name}</span>
                        <span className="text-xs font-mono text-slate-500">
                          {formatDate(ev.createdAt)}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] font-mono text-[11px] text-emerald-400 break-all mb-3">
                        SHA-256: {ev.fileHash}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                        <span>
                          Sumber:{' '}
                          <strong className="text-slate-200">{ev.sourceDevice}</strong>
                        </span>
                        <span>
                          Dikumpulkan oleh:{' '}
                          <strong className="text-slate-200">
                            {ev.collectedBy?.name || 'Investigator'}
                          </strong>
                        </span>
                        {ev.description && (
                          <span>
                            Keterangan:{' '}
                            <strong className="text-slate-200">{ev.description}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Containment Checklist */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {canEdit && (
              <form
                onSubmit={addTask}
                className="bg-[#11131a] border border-white/[0.06] rounded-2xl p-6"
              >
                <h3 className="text-sm font-semibold text-white mb-2">
                  Tambah Tindakan Mitigasi / Containment
                </h3>
                <div className="flex gap-3">
                  <input
                    value={taskForm}
                    onChange={(e) => setTaskForm(e.target.value)}
                    placeholder="Contoh: Putuskan kabel LAN server, isolasi vlan, blokir IP di firewall..."
                    required
                    className={inputClass + ' flex-1'}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Tambah Task
                  </button>
                </div>
              </form>
            )}

            <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Containment Checklist</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {incident.containmentTasks.filter((t: any) => t.isCompleted).length} dari{' '}
                    {incident.containmentTasks.length} langkah mitigasi selesai
                  </p>
                </div>
              </div>

              {incident.containmentTasks.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  Belum ada checklist penanganan.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {incident.containmentTasks.map((task: any) => (
                    <div
                      key={task.id}
                      className={`px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors ${
                        task.isCompleted ? 'opacity-60' : ''
                      }`}
                    >
                      <button
                        onClick={() => !task.isCompleted && completeTask(task.id)}
                        disabled={task.isCompleted || isLoading}
                        className="text-slate-500 hover:text-emerald-400 transition-colors disabled:cursor-default cursor-pointer flex-shrink-0"
                      >
                        {task.isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs font-medium ${
                            task.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.isCompleted && task.completedBy && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Diselesaikan oleh {task.completedBy.name} • {formatDate(task.completedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
