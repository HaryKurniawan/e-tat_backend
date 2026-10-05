import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';

/**
 * Mendapatkan data Asesmen Medis berdasarkan ID Permohonan
 */
export const getAsesmenMedisByPermohonan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');

    const asesmen = await prisma.asesmenMedis.findUnique({
      where: { permohonanId },
      include: {
        riwayatZat: true,
        hasilUrin: true,
        instrumenKriteriaPlasemen: {
          include: {
            penilaianPerDimensi: true,
          },
        },
        permohonan: {
          include: {
            terperiksa: true,
            perkara: true,
            dokumenList: true,
          },
        },
      },
    });

    if (!asesmen) {
      sendNotFound(res, 'Asesmen medis belum diinisiasi untuk permohonan ini');
      return;
    }

    sendSuccess(res, asesmen, 'Data asesmen medis berhasil diambil');
  } catch (err) {
    next(err);
  }
};
