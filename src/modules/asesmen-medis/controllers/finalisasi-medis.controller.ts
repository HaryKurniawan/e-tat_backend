import { Request, Response, NextFunction } from 'express';
import { AssessmentStatus } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * Finalisasi Asesmen Medis
 */
export const finalisasiMedis = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const user = req.user!;

    const asesmen = await prisma.asesmenMedis.findUnique({
      where: { permohonanId },
    });

    if (!asesmen) {
      sendNotFound(res, 'Asesmen medis belum diisi');
      return;
    }

    const updated = await prisma.asesmenMedis.update({
      where: { permohonanId },
      data: {
        status: AssessmentStatus.FINAL,
        finalizedAt: new Date(),
        finalizedBy: user.name,
      },
    });

    // Update Permohonan medicalStatus
    await prisma.permohonanAsesmen.update({
      where: { id: permohonanId },
      data: { medicalStatus: AssessmentStatus.FINAL },
    });

    // Audit log
    await logAudit({
      permohonanId,
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      aksi: 'FINALISASI_ASESMEN_MEDIS',
      rincian: `Asesmen medis telah difinalisasi oleh ${user.name}`,
    });

    sendSuccess(res, updated, 'Asesmen medis berhasil difinalisasi');
  } catch (err) {
    next(err);
  }
};
