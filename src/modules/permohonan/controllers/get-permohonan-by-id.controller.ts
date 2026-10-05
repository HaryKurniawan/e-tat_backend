import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound, sendForbidden } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';
import { permohonanFullInclude } from '../permohonan.helper';

/**
 * GET /api/permohonan/:id
 * Detail permohonan lengkap
 */
export const getPermohonanById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req, 'id');
    const role = req.user!.role as UserRole;
    const userId = req.user!.id;

    const data = await prisma.permohonanAsesmen.findUnique({
      where: { id },
      include: permohonanFullInclude,
    });

    if (!data) {
      sendNotFound(res, 'Permohonan tidak ditemukan');
      return;
    }

    // RBAC: Pengaju hanya bisa lihat milik sendiri
    if (role === 'PENGAJU' && data.pengajuId !== userId) {
      sendForbidden(res, 'Anda tidak memiliki akses ke permohonan ini');
      return;
    }

    // RBAC: Medis hanya bisa lihat kasus yang ditugaskan
    if (role === 'MEDIS' && data.timAsesmen?.asesorMedisId !== userId) {
      sendForbidden(res, 'Anda tidak ditugaskan pada permohonan ini');
      return;
    }

    // RBAC: Hukum hanya bisa lihat kasus yang ditugaskan
    if (role === 'HUKUM' && data.timAsesmen?.asesorHukumId !== userId) {
      sendForbidden(res, 'Anda tidak ditugaskan pada permohonan ini');
      return;
    }

    sendSuccess(res, data, 'Detail permohonan berhasil diambil');
  } catch (err) {
    next(err);
  }
};
