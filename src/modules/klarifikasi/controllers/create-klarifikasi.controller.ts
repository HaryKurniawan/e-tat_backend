import { Request, Response, NextFunction } from 'express';
import { KlarifikasiStatus, UserRole } from '@prisma/client';
import prisma from '../../../config/database';
import { sendCreated } from '../../../utils/response.util';
import { createKlarifikasiSchema } from '../klarifikasi.schema';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * Membuat tiket klarifikasi baru
 */
export const createKlarifikasi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const user = req.user!;
    const body = createKlarifikasiSchema.parse(req.body);

    const item = await prisma.klarifikasi.create({
      data: {
        permohonanId,
        dariUserId: user.id,
        dariNama: user.name,
        dariPeran: user.role,
        kepadaPeran: body.kepadaPeran as UserRole,
        pertanyaan: body.pertanyaan,
        lampiran: body.lampiran,
        status: KlarifikasiStatus.menunggu_tanggapan,
      },
    });

    await logAudit({
      permohonanId,
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      aksi: 'BUAT_KLARIFIKASI',
      rincian: `Pertanyaan klarifikasi diajukan oleh ${user.name} kepada ${body.kepadaPeran}`,
    });

    sendCreated(res, item, 'Pertanyaan klarifikasi berhasil dikirim');
  } catch (err) {
    next(err);
  }
};
