import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';

/**
 * Mendapatkan dokumen rekomendasi permohonan
 */
export const getRekomendasiByPermohonan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');

    const rekomendasi = await prisma.rekomendasiResmi.findUnique({
      where: { permohonanId },
      include: {
        daftarPengesah: true,
        permohonan: {
          include: {
            terperiksa: true,
            perkara: true,
            asesmenMedis: true,
            asesmenHukum: true,
            sidangPleno: true,
          },
        },
      },
    });

    if (!rekomendasi) {
      sendNotFound(res, 'Rekomendasi resmi belum diterbitkan untuk permohonan ini');
      return;
    }

    sendSuccess(res, rekomendasi, 'Data rekomendasi resmi berhasil diambil');
  } catch (err) {
    next(err);
  }
};
