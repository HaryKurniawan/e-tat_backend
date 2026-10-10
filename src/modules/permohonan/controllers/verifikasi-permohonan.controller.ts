import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { verifikasiSchema } from '../permohonan.schema';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * POST /api/permohonan/:id/verifikasi
 * Admin: Verifikasi berkas (SUBMITTED → ADMIN_REVIEW)
 */
export const verifikasiPermohonan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req, 'id');
    const { catatanVerifikasi, dokumenStatus } = verifikasiSchema.parse(req.body);

    const permohonan = await prisma.permohonanAsesmen.findUnique({ where: { id } });
    if (!permohonan) {
      sendNotFound(res);
      return;
    }

    if (dokumenStatus.length > 0) {
      await Promise.all(
        dokumenStatus.map((ds) =>
          prisma.dokumenPersyaratan.update({
            where: { id: ds.dokumenId },
            data: {
              statusVerifikasi: ds.status,
              catatanKoreksi: ds.catatanKoreksi,
            },
          })
        )
      );
    }

    const updated = await prisma.permohonanAsesmen.update({
      where: { id },
      data: { applicationStatus: 'AWAITING_DISPOSITION' },
    });

    await logAudit({
      actorId: req.user!.id,
      actorNama: req.user!.name,
      actorPeran: req.user!.role,
      permohonanId: id,
      aksi: 'VERIFIKASI_BERKAS',
      rincian: catatanVerifikasi || `Verifikasi berkas permohonan ${permohonan.nomorPermohonan}`,
    });

    sendSuccess(res, updated, 'Berkas berhasil diverifikasi');
  } catch (err) {
    next(err);
  }
};
