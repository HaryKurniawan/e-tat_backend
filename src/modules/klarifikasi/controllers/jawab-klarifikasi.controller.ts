import { Request, Response, NextFunction } from 'express';
import { KlarifikasiStatus } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { jawabKlarifikasiSchema } from '../klarifikasi.schema';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * Menjawab tiket klarifikasi
 */
export const jawabKlarifikasi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req, 'id');
    const user = req.user!;
    const body = jawabKlarifikasiSchema.parse(req.body);

    const item = await prisma.klarifikasi.findUnique({
      where: { id },
    });

    if (!item) {
      sendNotFound(res, 'Tiket klarifikasi tidak ditemukan');
      return;
    }

    const updated = await prisma.klarifikasi.update({
      where: { id },
      data: {
        jawaban: body.jawaban,
        dijawabOleh: user.name,
        tanggalJawab: new Date(),
        status: KlarifikasiStatus.selesai,
      },
    });

    await logAudit({
      permohonanId: item.permohonanId,
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      aksi: 'JAWAB_KLARIFIKASI',
      rincian: `Klarifikasi dijawab oleh ${user.name}`,
    });

    sendSuccess(res, updated, 'Tanggapan klarifikasi berhasil disimpan');
  } catch (err) {
    next(err);
  }
};
