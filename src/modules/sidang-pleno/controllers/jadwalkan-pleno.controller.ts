import { Request, Response, NextFunction } from 'express';
import { StatusPleno } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { jadwalPlenoSchema } from '../sidang-pleno.schema';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * Menjadwalkan Sidang Pleno
 */
export const jadwalkanPleno = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const user = req.user!;
    const body = jadwalPlenoSchema.parse(req.body);

    const permohonan = await prisma.permohonanAsesmen.findUnique({
      where: { id: permohonanId },
      include: { timAsesmen: true },
    });

    if (!permohonan) {
      sendNotFound(res, 'Permohonan tidak ditemukan');
      return;
    }

    const tgl = new Date(body.tanggalPleno);

    const pleno = await prisma.sidangPleno.upsert({
      where: { permohonanId },
      create: {
        permohonanId,
        tanggalPleno: tgl,
        waktu: body.waktu,
        tempat: body.tempat,
        pimpinanPleno: body.pimpinanPleno || user.name,
        statusPleno: StatusPleno.terjadwal,
      },
      update: {
        tanggalPleno: tgl,
        waktu: body.waktu,
        tempat: body.tempat,
        pimpinanPleno: body.pimpinanPleno || user.name,
        statusPleno: StatusPleno.terjadwal,
      },
    });

    // Update jadwal pleno di timAsesmen
    if (permohonan.timAsesmen) {
      await prisma.timAsesmen.update({
        where: { id: permohonan.timAsesmen.id },
        data: { jadwalPleno: tgl },
      });
    }

    await logAudit({
      permohonanId,
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      aksi: 'JADWALKAN_PLENO',
      rincian: `Sidang pleno dijadwalkan pada ${tgl.toISOString()} oleh ${user.name}`,
    });

    sendSuccess(res, pleno, 'Jadwal sidang pleno berhasil disimpan');
  } catch (err) {
    next(err);
  }
};
