import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendForbidden, sendNotFound } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';
import { checkTindakLanjutAuthorization } from '../tindak-lanjut.auth';

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
    const user = req.user!;

    // Validasi otorisasi (khususnya pembatasan akses tenaga medis & pengaju)
    const authCheck = await checkTindakLanjutAuthorization(permohonanId, user);
    if (!authCheck.authorized) {
      if (authCheck.notFound) {
        sendNotFound(res, authCheck.message);
      } else {
        sendForbidden(res, authCheck.message);
      }
      return;
    }

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
