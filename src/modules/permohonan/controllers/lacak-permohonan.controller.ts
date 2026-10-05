import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';

/**
 * GET /api/lacak/:trackingNumber
 * Publik: Cek status permohonan via nomor lacak (info terbatas)
 */
export const lacakPermohonan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trackingNumber = getParam(req, 'trackingNumber');

    const data = await prisma.permohonanAsesmen.findFirst({
      where: {
        OR: [{ trackingNumber }, { nomorPermohonan: trackingNumber }],
      },
      select: {
        id: true,
        trackingNumber: true,
        nomorPermohonan: true,
        tanggalPengajuan: true,
        applicationStatus: true,
        terperiksa: { select: { namaLengkap: true } },
        instansiPengaju: true,
        updatedAt: true,
      },
    });

    if (!data) {
      sendNotFound(res, 'Nomor permohonan tidak ditemukan');
      return;
    }

    sendSuccess(res, data, 'Status permohonan ditemukan');
  } catch (err) {
    next(err);
  }
};
