import { Request, Response, NextFunction } from 'express';
import { AssessmentStatus } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess, sendError } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * Amandemen Asesmen Hukum
 */
export const amandemenHukum = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const { catatanAmandemen } = req.body;
    const user = req.user!;

    if (!catatanAmandemen) {
      sendError(res, 'Catatan amandemen wajib disertakan', 400);
      return;
    }

    const updated = await prisma.asesmenHukum.update({
      where: { permohonanId },
      data: {
        amendmentNote: catatanAmandemen,
        status: AssessmentStatus.AMENDMENT_REQUIRED,
      },
    });

    await prisma.permohonanAsesmen.update({
      where: { id: permohonanId },
      data: { legalStatus: AssessmentStatus.AMENDMENT_REQUIRED },
    });

    await logAudit({
      permohonanId,
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      aksi: 'AMANDEMEN_ASESMEN_HUKUM',
      rincian: `Permintaan amandemen hukum: ${catatanAmandemen}`,
    });

    sendSuccess(res, updated, 'Status asesmen hukum berhasil dibuka kembali untuk amandemen');
  } catch (err) {
    next(err);
  }
};
