import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';

/**
 * GET /api/registrasi/status/:identifier
 * Publik: Cek status pendaftaran akun berdasarkan email atau nomorRegistrasi atau NRP
 */
export const checkStatusRegistrasi = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const raw = getParam(req, 'identifier');
    const identifier = decodeURIComponent(raw).trim().toLowerCase();
    if (!identifier) {
      sendNotFound(res, 'Parameter email atau nomor registrasi tidak ditemukan');
      return;
    }

    const reg = await prisma.registrasiPengguna.findFirst({
      where: {
        OR: [
          { email: identifier },
          { nomorRegistrasi: { equals: raw.trim(), mode: 'insensitive' } },
          { nrp: identifier },
        ],
      },
    });

    if (!reg) {
      sendNotFound(res, 'Data pendaftaran akun tidak ditemukan');
      return;
    }

    sendSuccess(res, reg, 'Data status pendaftaran berhasil ditemukan');
  } catch (err) {
    next(err);
  }
};
