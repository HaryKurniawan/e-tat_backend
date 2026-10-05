import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendPaginated } from '../../../utils/response.util';
import { getPagination } from '../../../utils/pagination.util';

/**
 * Mengambil log aktivitas audit trail (khusus Admin / Sekretariat)
 */
export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = getPagination(req);
    const { permohonanId, userId, aksi } = req.query;

    const where: any = {};
    if (permohonanId) where.permohonanId = String(permohonanId);
    if (userId) where.actorId = String(userId);
    if (aksi) where.aksi = String(aksi);

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    sendPaginated(res, logs, total, page, limit, 'Data log audit berhasil diambil');
  } catch (err) {
    next(err);
  }
};
