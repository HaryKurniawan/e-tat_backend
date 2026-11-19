import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendError, sendNotFound, sendForbidden } from '../../../utils/response.util';
import { generateNomorPermohonan } from '../../../utils/nomor.util';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';
import { sendNotifikasiPermohonanBaruEmail } from '../../../services/email.service';

/**
 * POST /api/permohonan/:id/submit
 * Pengaju: Submit permohonan (DRAFT → SUBMITTED)
 */
export const submitPermohonan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req, 'id');

    const permohonan = await prisma.permohonanAsesmen.findUnique({
      where: { id },
      include: { terperiksa: true, perkara: true },
    });
    if (!permohonan) {
      sendNotFound(res);
      return;
    }
    if (permohonan.pengajuId !== req.user!.id) {
      sendForbidden(res);
      return;
    }
    if (permohonan.applicationStatus === 'SUBMITTED') {
      sendSuccess(res, permohonan, 'Permohonan sudah dalam status diajukan (SUBMITTED)');
      return;
    }
    if (
      permohonan.applicationStatus !== 'DRAFT' &&
      permohonan.applicationStatus !== 'NEEDS_CORRECTION'
    ) {
      sendError(res, 'Permohonan tidak bisa disubmit dari status saat ini', 400);
      return;
    }

    const nomorPermohonan =
      permohonan.applicationStatus === 'DRAFT'
        ? await generateNomorPermohonan()
        : permohonan.nomorPermohonan;

    const updated = await prisma.permohonanAsesmen.update({
      where: { id },
      data: {
        applicationStatus: 'SUBMITTED',
        nomorPermohonan,
        revision: { increment: permohonan.applicationStatus === 'NEEDS_CORRECTION' ? 1 : 0 },
      },
    });

    await logAudit({
      actorId: req.user!.id,
      actorNama: req.user!.name,
      actorPeran: req.user!.role,
      permohonanId: id,
      aksi: 'SUBMIT_PERMOHONAN',
      rincian: `Permohonan ${nomorPermohonan} disubmit untuk verifikasi`,
    });

    // Cari email admin / sekretariat untuk notifikasi email
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN', isActive: true },
    });

    if (adminUser?.email) {
      sendNotifikasiPermohonanBaruEmail({
        adminEmail: adminUser.email,
        nomorPermohonan,
        trackingNumber: updated.trackingNumber,
        namaPemohon: req.user!.name,
        instansiPemohon: req.user!.agency || 'Penyidik POLRI',
        terperiksaNama: permohonan.terperiksa?.namaLengkap || 'Terperiksa',
        nomorLp: permohonan.perkara?.nomorLaporanPolisi || '-',
      }).catch((err) => {
        console.error('❌ Gagal mengirim notifikasi email permohonan baru ke Admin:', err);
      });
    }

    sendSuccess(res, updated, 'Permohonan berhasil disubmit');
  } catch (err) {
    next(err);
  }
};
