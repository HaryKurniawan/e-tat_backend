import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';

/**
 * Mengambil informasi Sidang Pleno untuk sebuah permohonan
 */
export const getSidangPlenoByPermohonan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');

    const pleno = await prisma.sidangPleno.findUnique({
      where: { permohonanId },
      include: {
        daftarHadir: true,
        permohonan: {
          include: {
            terperiksa: true,
            asesmenMedis: true,
            asesmenHukum: true,
          },
        },
      },
    });

    if (!pleno) {
      sendNotFound(res, 'Sidang pleno belum dijadwalkan');
      return;
    }

    sendSuccess(res, pleno, 'Data sidang pleno berhasil diambil');
  } catch (err) {
    next(err);
  }
};
