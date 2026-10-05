import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

/**
 * Middleware otomatis mencatat aktivitas ke audit log.
 * Dipanggil setelah request berhasil diproses.
 *
 * Gunakan: router.post('/submit', authMiddleware, auditLog('SUBMIT_PERMOHONAN'), controller)
 */
export const auditLog = (aksi: string, getRincian?: (req: Request, res: Response) => string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Simpan original json method
    const originalJson = res.json.bind(res);

    // Override res.json untuk intercept response
    res.json = function (body) {
      // Hanya log jika response sukses (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const permohonanId = req.params.id || body?.data?.id || undefined;
        const rincian = getRincian
          ? getRincian(req, res)
          : `${aksi} oleh ${req.user.name} (${req.user.role})`;

        // Fire and forget - tidak block response
        prisma.auditLog.create({
          data: {
            actorId: req.user.id,
            actorNama: req.user.name,
            actorPeran: req.user.role,
            permohonanId: permohonanId || undefined,
            aksi,
            rincian,
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
          },
        }).catch(console.error);
      }

      return originalJson(body);
    };

    next();
  };
};
