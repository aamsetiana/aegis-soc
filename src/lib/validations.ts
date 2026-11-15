import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid').max(255),
  password: z.string().min(1, 'Password wajib diisi').max(128),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100).trim(),
  email: z.string().email('Format email tidak valid').max(255).toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus mengandung huruf kapital')
    .regex(/[a-z]/, 'Harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Harus mengandung angka')
    .regex(/[@$!%*?&#^()_\-+=]/, 'Harus mengandung karakter khusus (@$!%*?&#)'),
  department: z.string().max(100).optional(),
})

export const incidentSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter').max(255).trim(),
  description: z.string().min(20, 'Deskripsi minimal 20 karakter').max(5000).trim(),
  category: z.enum([
    'PHISHING',
    'MALWARE',
    'RANSOMWARE',
    'UNAUTHORIZED_ACCESS',
    'DDOS',
    'DATA_LEAK',
    'INSIDER_THREAT',
    'OTHER',
  ]),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  tlp: z.enum(['RED', 'AMBER', 'GREEN', 'WHITE']),
  affectedSystems: z.string().max(500).optional(),
  assignedToId: z.string().uuid().optional(),
})

export const iocSchema = z.object({
  type: z.enum(['IP_ADDRESS', 'DOMAIN', 'URL', 'MD5_HASH', 'SHA256_HASH', 'EMAIL', 'FILE_NAME']),
  value: z.string().min(1, 'Nilai IOC wajib diisi').max(500).trim(),
  threatLevel: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  notes: z.string().max(1000).optional(),
})

export const evidenceSchema = z.object({
  name: z.string().min(1, 'Nama artefak wajib diisi').max(255).trim(),
  fileHash: z.string().min(32, 'Hash minimal 32 karakter').max(128).trim(),
  fileType: z.string().max(50).trim(),
  fileSize: z.number().int().positive().optional(),
  sourceDevice: z.string().max(255).trim(),
  description: z.string().max(1000).optional(),
})

export const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'TRIAGED', 'CONTAINED', 'ERADICATED', 'CLOSED']),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type IncidentInput = z.infer<typeof incidentSchema>
export type IOCInput = z.infer<typeof iocSchema>
export type EvidenceInput = z.infer<typeof evidenceSchema>
