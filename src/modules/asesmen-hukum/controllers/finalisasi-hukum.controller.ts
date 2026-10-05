import { Request, Response, NextFunction } from 'express';
import { AssessmentStatus } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * Finalisasi Asesmen Hukum
 */
export const finalisasiHukum = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const user = req.user!;

    const asesmen = await prisma.asesmenHukum.findUnique({
      where: { permohonanId },
    });

    if (!asesmen) {
      sendNotFound(res, 'Asesmen hukum belum dibuat');
      return;
    }

    const updated = await prisma.asesmenHukum.update({
      where: { permohonanId },
      data: {
        status: AssessmentStatus.FINAL,
        finalizedAt: new Date(),
        finalizedBy: user.name,
      },
    });

    await prisma.permohonanAsesmen.update({
      where: { id: permohonanId },
      data: { legalStatus: AssessmentStatus.FINAL },
    });

    await logAudit({
      permohonanId,
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      aksi: 'FINALISASI_ASESMEN_HUKUM',
      rincian: `Asesmen hukum telah difinalisasi oleh ${user.name}`,
    });

    sendSuccess(res, updated, 'Asesmen hukum berhasil difinalisasi');
  } catch (err) {
    next(err);
  }
};
