import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';

/**
 * Mendapatkan daftar klarifikasi untuk suatu permohonan
 */
export const getKlarifikasiList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');

    const list = await prisma.klarifikasi.findMany({
      where: { permohonanId },
      orderBy: { tanggalTanya: 'desc' },
    });

    sendSuccess(res, list, 'Daftar klarifikasi berhasil diambil');
  } catch (err) {
    next(err);
  }
};
