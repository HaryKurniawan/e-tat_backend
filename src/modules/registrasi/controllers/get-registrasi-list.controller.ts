import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendPaginated } from '../../../utils/response.util';
import { getPagination, getSearch } from '../../../utils/pagination.util';

/**
 * GET /api/registrasi
 * Admin: Daftar semua pendaftar
 */
export const getRegistrasiList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = getPagination(req);
    const search = getSearch(req);
    const status = req.query.status as any;

    const where: any = {};
    if (search) {
      where.OR = [
        { namaLengkap: { contains: search, mode: 'insensitive' } },
        { nrp: { contains: search, mode: 'insensitive' } },
        { instansi: { contains: search, mode: 'insensitive' } },
        { nomorRegistrasi: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.registrasiPengguna.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggalDaftar: 'desc' },
        include: { approvedBy: { select: { name: true, role: true } } },
      }),
      prisma.registrasiPengguna.count({ where }),
    ]);

    sendPaginated(res, data, total, page, limit, 'Daftar registrasi berhasil diambil');
  } catch (err) {
    next(err);
  }
};
