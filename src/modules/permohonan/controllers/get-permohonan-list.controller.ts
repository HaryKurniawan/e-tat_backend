import { Request, Response, NextFunction } from 'express';
import { ApplicationStatus, UserRole } from '@prisma/client';
import prisma from '../../../config/database';
import { sendPaginated } from '../../../utils/response.util';
import { getPagination, getSearch } from '../../../utils/pagination.util';
import { getRoleBasedWhere } from '../permohonan.helper';

/**
 * GET /api/permohonan
 * Daftar permohonan (filter berdasarkan role)
 */
export const getPermohonanList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = getPagination(req);
    const search = getSearch(req);
    const status = req.query.status as ApplicationStatus | undefined;

    let where: any = {};

    if (search) {
      where.OR = [
        { nomorPermohonan: { contains: search, mode: 'insensitive' } },
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { terperiksa: { namaLengkap: { contains: search, mode: 'insensitive' } } },
        { perkara: { nomorLaporanPolisi: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) where.applicationStatus = status;

    where = getRoleBasedWhere(req.user!.id, req.user!.role as UserRole, where);

    const [data, total] = await Promise.all([
      prisma.permohonanAsesmen.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggalPengajuan: 'desc' },
        include: {
          pengaju: { select: { id: true, name: true, email: true, agency: true, nip: true, phone: true } },
          terperiksa: true,
          perkara: {
            include: {
              barangBuktiList: true,
            },
          },
          timAsesmen: {
            include: {
              asesorMedis: { select: { id: true, name: true, email: true } },
              asesorHukum: { select: { id: true, name: true, email: true } },
            },
          },
          dokumenList: true,
          asesmenMedis: {
            include: {
              riwayatZat: true,
              hasilUrin: true,
            },
          },
          asesmenHukum: true,
          sidangPleno: {
            include: {
              daftarHadir: true,
            },
          },
          rekomendasiResmi: {
            include: {
              daftarPengesah: true,
            },
          },
          tindakLanjutLayanan: true,
        },
      }),
      prisma.permohonanAsesmen.count({ where }),
    ]);

    sendPaginated(res, data, total, page, limit, 'Daftar permohonan berhasil diambil');
  } catch (err) {
    next(err);
  }
};
