import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';

/**
 * Mendapatkan data Tindak Lanjut dan Monitoring untuk permohonan
 */
export const getTindakLanjutByPermohonan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');

    const [tindakLanjut, monitoring] = await Promise.all([
      prisma.tindakLanjutLayanan.findUnique({
        where: { permohonanId },
      }),
      prisma.monitoringTindakLanjut.findUnique({
        where: { permohonanId },
        include: {
          pelaksanaanRehab: true,
          laporanKontrolList: {
            orderBy: { tanggalDiunggah: 'desc' },
          },
          buktiWajibLaporList: true,
          akhirLayanan: true,
        },
      }),
    ]);

    sendSuccess(
      res,
      { tindakLanjut, monitoring },
      'Data tindak lanjut dan monitoring berhasil diambil'
    );
  } catch (err) {
    next(err);
  }
};
