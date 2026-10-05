import { Request, Response, NextFunction } from 'express';
import { ApplicationStatus } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { disposisiSchema } from '../permohonan.schema';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * POST /api/permohonan/:id/disposisi
 * Admin: Catat disposisi ketua (→ AWAITING_DISPOSITION | APPROVED)
 */
export const catatDisposisi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req, 'id');
    const input = disposisiSchema.parse(req.body);

    const permohonan = await prisma.permohonanAsesmen.findUnique({
      where: { id },
      include: { timAsesmen: true },
    });
    if (!permohonan) {
      sendNotFound(res);
      return;
    }

    const newStatus: ApplicationStatus =
      input.disposisiHasil === 'disetujui'
        ? 'APPROVED'
        : input.disposisiHasil === 'ditolak'
        ? 'REJECTED'
        : 'AWAITING_DISPOSITION';

    await prisma.$transaction(async (tx) => {
      await tx.permohonanAsesmen.update({
        where: { id },
        data: { applicationStatus: newStatus },
      });

      if (permohonan.timAsesmen) {
        await tx.timAsesmen.update({
          where: { permohonanId: id },
          data: {
            disposisiHasil: input.disposisiHasil,
            disposisiAlasan: input.disposisiAlasan,
            disposisiTanggal: new Date(),
            disposisiKetua: input.disposisiKetua,
            disposisiJabatan: input.disposisiJabatan,
            disposisiBuktiUrl: input.disposisiBuktiUrl,
            sekretariatId: req.user!.id,
            sekretariatNama: req.user!.name,
          },
        });
      } else {
        await tx.timAsesmen.create({
          data: {
            permohonanId: id,
            sekretariatId: req.user!.id,
            sekretariatNama: req.user!.name,
            disposisiHasil: input.disposisiHasil,
            disposisiAlasan: input.disposisiAlasan,
            disposisiTanggal: new Date(),
            disposisiKetua: input.disposisiKetua,
            disposisiJabatan: input.disposisiJabatan,
            disposisiBuktiUrl: input.disposisiBuktiUrl,
          },
        });
      }
    });

    await logAudit({
      actorId: req.user!.id,
      actorNama: req.user!.name,
      actorPeran: req.user!.role,
      permohonanId: id,
      aksi: 'CATAT_DISPOSISI',
      rincian: `Disposisi: ${input.disposisiHasil} oleh Ketua: ${input.disposisiKetua}. Alasan: ${input.disposisiAlasan}`,
    });

    const updated = await prisma.permohonanAsesmen.findUnique({
      where: { id },
      include: { timAsesmen: true },
    });
    sendSuccess(res, updated, 'Disposisi berhasil dicatat');
  } catch (err) {
    next(err);
  }
};
