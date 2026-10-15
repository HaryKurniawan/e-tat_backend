import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { mintaPerbaikanSchema } from '../permohonan.schema';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * POST /api/permohonan/:id/minta-perbaikan
 * Admin: Minta perbaikan (→ NEEDS_CORRECTION)
 */
export const mintaPerbaikan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req, 'id');
    const { catatanPerbaikan, dokumenPerluDiperbaiki } = mintaPerbaikanSchema.parse(req.body);

    const permohonan = await prisma.permohonanAsesmen.findUnique({ where: { id } });
    if (!permohonan) {
      sendNotFound(res);
      return;
    }

    if (dokumenPerluDiperbaiki.length > 0) {
      await Promise.all(
        dokumenPerluDiperbaiki.map((d) =>
          prisma.dokumenPersyaratan.updateMany({
            where: { id: d.dokumenId, permohonanId: id },
            data: { statusVerifikasi: 'perlu_perbaikan', catatanKoreksi: d.catatanKoreksi },
          }).catch(() => null)
        )
      );
    }

    const updated = await prisma.permohonanAsesmen.update({
      where: { id },
      data: { applicationStatus: 'NEEDS_CORRECTION' },
    });

    await logAudit({
      actorId: req.user!.id,
      actorNama: req.user!.name,
      actorPeran: req.user!.role,
      permohonanId: id,
      aksi: 'MINTA_PERBAIKAN',
      rincian: catatanPerbaikan,
    });

    sendSuccess(res, updated, 'Permintaan perbaikan berhasil dikirim');
  } catch (err) {
    next(err);
  }
};
