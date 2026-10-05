import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendError, sendNotFound } from '../../../utils/response.util';
import { rejectRegistrasiSchema } from '../registrasi.schema';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * PATCH /api/registrasi/:id/reject
 * Admin: Tolak pendaftaran
 */
export const rejectRegistrasi = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req, 'id');
    const { catatanAdmin } = rejectRegistrasiSchema.parse(req.body);

    const registrasi = await prisma.registrasiPengguna.findUnique({ where: { id } });
    if (!registrasi) {
      sendNotFound(res, 'Data registrasi tidak ditemukan');
      return;
    }

    if (registrasi.status !== 'pending') {
      sendError(res, `Registrasi sudah berstatus: ${registrasi.status}`, 400);
      return;
    }

    const updated = await prisma.registrasiPengguna.update({
      where: { id },
      data: { status: 'rejected', catatanAdmin, approvedById: req.user!.id },
    });

    await logAudit({
      actorId: req.user!.id,
      actorNama: req.user!.name,
      actorPeran: req.user!.role,
      aksi: 'REJECT_REGISTRASI',
      rincian: `Menolak registrasi: ${registrasi.namaLengkap}. Alasan: ${catatanAdmin}`,
    });

    sendSuccess(res, updated, 'Registrasi ditolak');
  } catch (err) {
    next(err);
  }
};
