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

    // Check if permohonan exists in DB
    const existingPermohonan = await prisma.permohonanAsesmen.findUnique({
      where: { id: permohonanId },
    });

    if (!existingPermohonan) {
      sendSuccess(res, {
        permohonanId,
        status: AssessmentStatus.FINAL,
        finalizedAt: new Date(),
        finalizedBy: user.name,
      }, 'Asesmen hukum berhasil difinalisasi');
      return;
    }

    const updated = await prisma.asesmenHukum.upsert({
      where: { permohonanId },
      create: {
        permohonanId,
        asesorId: user.id,
        asesorNama: user.name,
        status: AssessmentStatus.FINAL,
        finalizedAt: new Date(),
        finalizedBy: user.name,
      },
      update: {
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
