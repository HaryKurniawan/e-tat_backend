import prisma from '../config/database';

export interface AuditParams {
  actorId?: string;
  actorNama: string;
  actorPeran: string;
  permohonanId?: string;
  aksi: string;
  rincian: string;
  ipAddress?: string;
  userAgent?: string;
}

export const logAudit = async (params: AuditParams): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        actorNama: params.actorNama,
        actorPeran: params.actorPeran,
        permohonanId: params.permohonanId,
        aksi: params.aksi,
        rincian: params.rincian,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
};
