import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';

/**
 * GET /api/registrasi/:id
 * Admin: Detail pendaftar
 */
export const getRegistrasiById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req, 'id');
    const data = await prisma.registrasiPengguna.findUnique({
      where: { id },
      include: { approvedBy: { select: { name: true, role: true } } },
    });

    if (!data) {
      sendNotFound(res, 'Data registrasi tidak ditemukan');
      return;
    }

    sendSuccess(res, data, 'Data registrasi berhasil diambil');
  } catch (err) {
    next(err);
  }
};
