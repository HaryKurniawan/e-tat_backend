import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';

/**
 * Mendapatkan data Asesmen Hukum berdasarkan ID Permohonan
 */
export const getAsesmenHukumByPermohonan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');

    const asesmen = await prisma.asesmenHukum.findUnique({
      where: { permohonanId },
      include: {
        permohonan: {
          include: {
            terperiksa: true,
            perkara: {
              include: {
                barangBuktiList: true,
              },
            },
            dokumenList: true,
          },
        },
      },
    });

    if (!asesmen) {
      sendNotFound(res, 'Asesmen hukum belum diinisiasi untuk permohonan ini');
      return;
    }

    sendSuccess(res, asesmen, 'Data asesmen hukum berhasil diambil');
  } catch (err) {
    next(err);
  }
};
