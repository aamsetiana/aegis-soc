import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Severity, TLP, IncidentStatus, IncidentCategory } from '@prisma/client'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateCaseNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  const ms = Date.now().toString().slice(-4)
  return `INC-${year}-${ms}${random.toString().slice(0, 2)}`
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getSeverityColor(severity: Severity): string {
  const map: Record<Severity, string> = {
    CRITICAL: 'text-red-400 bg-red-500/20 border-red-500/30',
    HIGH: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    MEDIUM: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    LOW: 'text-green-400 bg-green-500/20 border-green-500/30',
  }
  return map[severity] || 'text-slate-400 bg-slate-500/20 border-slate-500/30'
}

export function getTLPColor(tlp: TLP): string {
  const map: Record<TLP, string> = {
    RED: 'text-red-400 bg-red-500/20 border-red-500/50',
    AMBER: 'text-amber-400 bg-amber-500/20 border-amber-500/50',
    GREEN: 'text-green-400 bg-green-500/20 border-green-500/50',
    WHITE: 'text-slate-200 bg-slate-500/20 border-slate-500/50',
  }
  return map[tlp] || 'text-slate-400 bg-slate-500/20 border-slate-500/50'
}

export function getStatusColor(status: IncidentStatus): string {
  const map: Record<IncidentStatus, string> = {
    NEW: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    TRIAGED: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    CONTAINED: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    ERADICATED: 'text-teal-400 bg-teal-500/20 border-teal-500/30',
    CLOSED: 'text-slate-400 bg-slate-500/20 border-slate-500/30',
  }
  return map[status] || 'text-slate-400 bg-slate-500/20 border-slate-500/30'
}

export function getCategoryLabel(category: IncidentCategory): string {
  const map: Record<IncidentCategory, string> = {
    PHISHING: 'Phishing Campaign',
    MALWARE: 'Malware Infection',
    RANSOMWARE: 'Ransomware Attack',
    UNAUTHORIZED_ACCESS: 'Unauthorized Access',
    DDOS: 'DDoS Attack',
    DATA_LEAK: 'Data Leak / Exfiltration',
    INSIDER_THREAT: 'Insider Threat',
    OTHER: 'Other Security Event',
  }
  return map[category] || category
}

export function calculateMTTR(detectedAt: Date | string, closedAt: Date | string | null): string {
  if (!closedAt) return 'Ongoing'
  const diffMs = new Date(closedAt).getTime() - new Date(detectedAt).getTime()
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (diffHrs > 24) {
    const days = Math.floor(diffHrs / 24)
    return `${days}d ${diffHrs % 24}h`
  }
  return `${diffHrs}h ${diffMins}m`
}
