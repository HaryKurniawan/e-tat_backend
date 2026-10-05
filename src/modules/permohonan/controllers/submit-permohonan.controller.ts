import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendError, sendNotFound, sendForbidden } from '../../../utils/response.util';
import { generateNomorPermohonan } from '../../../utils/nomor.util';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * POST /api/permohonan/:id/submit
 * Pengaju: Submit permohonan (DRAFT → SUBMITTED)
 */
export const submitPermohonan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req, 'id');

    const permohonan = await prisma.permohonanAsesmen.findUnique({ where: { id } });
    if (!permohonan) {
      sendNotFound(res);
      return;
    }
    if (permohonan.pengajuId !== req.user!.id) {
      sendForbidden(res);
      return;
    }
    if (
      permohonan.applicationStatus !== 'DRAFT' &&
      permohonan.applicationStatus !== 'NEEDS_CORRECTION'
    ) {
      sendError(res, 'Permohonan tidak bisa disubmit dari status saat ini', 400);
      return;
    }

    const nomorPermohonan =
      permohonan.applicationStatus === 'DRAFT'
        ? await generateNomorPermohonan()
        : permohonan.nomorPermohonan;

    const updated = await prisma.permohonanAsesmen.update({
      where: { id },
      data: {
        applicationStatus: 'SUBMITTED',
        nomorPermohonan,
        revision: { increment: permohonan.applicationStatus === 'NEEDS_CORRECTION' ? 1 : 0 },
      },
    });

    await logAudit({
      actorId: req.user!.id,
      actorNama: req.user!.name,
      actorPeran: req.user!.role,
      permohonanId: id,
      aksi: 'SUBMIT_PERMOHONAN',
      rincian: `Permohonan ${nomorPermohonan} disubmit untuk verifikasi`,
    });

    sendSuccess(res, updated, 'Permohonan berhasil disubmit');
  } catch (err) {
    next(err);
  }
};
