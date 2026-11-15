import { prisma } from '@/lib/db'
import { AuditAction, AuditStatus } from '@prisma/client'

interface AuditLogParams {
  action: AuditAction
  userId?: string
  resource?: string
  status?: AuditStatus
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        userId: params.userId,
        resource: params.resource,
        status: params.status || AuditStatus.SUCCESS,
        details: (params.details as object) || undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
  } catch (error) {
    console.error('[AuditLog] Failed to create audit log:', error)
  }
}
