import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { penugasanSchema } from '../permohonan.schema';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * POST /api/permohonan/:id/tugaskan
 * Admin: Penugasan tim asesmen & jadwal
 */
export const tugaskanTimAsesmen = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req, 'id');
    const input = penugasanSchema.parse(req.body);

    const permohonan = await prisma.permohonanAsesmen.findUnique({
      where: { id },
      include: { timAsesmen: true },
    });
    if (!permohonan) {
      sendNotFound(res);
      return;
    }

    const timData: any = {
      sekretariatId: req.user!.id,
      sekretariatNama: req.user!.name,
      ...input,
      jadwalPemeriksaanMedis: input.jadwalPemeriksaanMedis
        ? new Date(input.jadwalPemeriksaanMedis)
        : undefined,
      jadwalPemeriksaanHukum: input.jadwalPemeriksaanHukum
        ? new Date(input.jadwalPemeriksaanHukum)
        : undefined,
      jadwalPleno: input.jadwalPleno ? new Date(input.jadwalPleno) : undefined,
    };

    await prisma.$transaction(async (tx) => {
      if (permohonan.timAsesmen) {
        await tx.timAsesmen.update({ where: { permohonanId: id }, data: timData });
      } else {
        await tx.timAsesmen.create({ data: { ...timData, permohonanId: id } });
      }

      await tx.permohonanAsesmen.update({
        where: { id },
        data: { applicationStatus: 'SCHEDULED' },
      });
    });

    await logAudit({
      actorId: req.user!.id,
      actorNama: req.user!.name,
      actorPeran: req.user!.role,
      permohonanId: id,
      aksi: 'TUGASKAN_TIM',
      rincian: `Tim ditugaskan - Medis: ${input.asesorMedisNama || '-'}, Hukum: ${
        input.asesorHukumNama || '-'
      }`,
    });

    const updated = await prisma.permohonanAsesmen.findUnique({
      where: { id },
      include: { timAsesmen: true },
    });
    sendSuccess(res, updated, 'Tim asesmen berhasil ditugaskan');
  } catch (err) {
    next(err);
  }
};
