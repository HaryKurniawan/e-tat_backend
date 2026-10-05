import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess } from '../../../utils/response.util';

/**
 * Statistik analitik permohonan (grafik, tren bulan, status)
 */
export const getAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const statusCounts = await prisma.permohonanAsesmen.groupBy({
      by: ['applicationStatus'],
      _count: {
        id: true,
      },
    });

    const riwayatZatPopular = await prisma.riwayatZat.groupBy({
      by: ['jenisZat'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    const hasilPlenoDistribusi = await prisma.sidangPleno.groupBy({
      by: ['jenisRekomendasiFinal'],
      _count: {
        id: true,
      },
      where: {
        jenisRekomendasiFinal: { not: null },
      },
    });

    sendSuccess(
      res,
      {
        statusCounts,
        riwayatZatPopular,
        hasilPlenoDistribusi,
      },
      'Data analitik sistem TAT berhasil diambil'
    );
  } catch (err) {
    next(err);
  }
};
