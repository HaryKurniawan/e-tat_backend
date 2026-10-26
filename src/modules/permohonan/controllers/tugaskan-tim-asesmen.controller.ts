import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { penugasanSchema } from '../permohonan.schema';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';
import { sendPenugasanHukumEmail, sendPenugasanMedisEmail } from '../../../services/email.service';
import { kirimSuratJawabanKePengaju } from '../../surat-jawaban/surat-jawaban.service';

/**
 * POST /api/permohonan/:id/tugaskan
 * Admin: Penugasan tim asesmen & jadwal
 */
export const tugaskanTimAsesmen = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req, 'id');
    const input = penugasanSchema.parse(req.body);

    const permohonan = await prisma.permohonanAsesmen.findUnique({
      where: { id },
      include: { timAsesmen: true },
    });
    if (!permohonan) {
      sendNotFound(res);
      return;
    }

    const timData: any = {
      sekretariatId: req.user!.id,
      sekretariatNama: req.user!.name,
      ...input,
      jadwalPemeriksaanMedis: input.jadwalPemeriksaanMedis
        ? new Date(input.jadwalPemeriksaanMedis)
        : undefined,
      jadwalPemeriksaanHukum: input.jadwalPemeriksaanHukum
        ? new Date(input.jadwalPemeriksaanHukum)
        : undefined,
      jadwalPleno: input.jadwalPleno ? new Date(input.jadwalPleno) : undefined,
    };

    await prisma.$transaction(async (tx) => {
      if (permohonan.timAsesmen) {
        await tx.timAsesmen.update({ where: { permohonanId: id }, data: timData });
      } else {
        await tx.timAsesmen.create({ data: { ...timData, permohonanId: id } });
      }

      await tx.permohonanAsesmen.update({
        where: { id },
        data: { applicationStatus: 'ASSESSMENT_ACTIVE' },
      });
    });

    await logAudit({
      actorId: req.user!.id,
      actorNama: req.user!.name,
      actorPeran: req.user!.role,
      permohonanId: id,
      aksi: 'TUGASKAN_TIM',
      rincian: `Tim ditugaskan - Medis: ${input.asesorMedisNama || '-'}, Hukum: ${
        input.asesorHukumNama || '-'
      }`,
    });

    const updated = await prisma.permohonanAsesmen.findUnique({
      where: { id },
      include: {
        timAsesmen: {
          include: {
            asesorHukum: true,
            asesorMedis: true,
          },
        },
        terperiksa: true,
        perkara: {
          include: {
            barangBuktiList: true,
          },
        },
      },
    });

    // Kirim notifikasi email ke Asesor Medis secara asynchronous (non-blocking)
    if (updated && updated.timAsesmen?.asesorMedis?.email && updated.terperiksa) {
      const asesorMedis = updated.timAsesmen.asesorMedis;
      sendPenugasanMedisEmail({
        asesorEmail: asesorMedis.email,
        asesorNama: asesorMedis.name,
        nomorPermohonan: updated.nomorPermohonan,
        trackingNumber: updated.trackingNumber,
        jadwalPemeriksaanMedis: updated.timAsesmen.jadwalPemeriksaanMedis,
        jadwalPleno: updated.timAsesmen.jadwalPleno,
        lokasiPemeriksaan: updated.timAsesmen.lokasiPemeriksaan,
        sekretariatNama: req.user!.name,
        terperiksa: updated.terperiksa,
        perkara: updated.perkara,
      }).catch((err) => {
        console.error('❌ Gagal mengirim notifikasi email penugasan medis:', err);
      });
    }

    // Kirim notifikasi email ke Asesor Hukum secara asynchronous (non-blocking)
    if (updated && updated.timAsesmen?.asesorHukum?.email && updated.terperiksa) {
      const asesorHukum = updated.timAsesmen.asesorHukum;
      sendPenugasanHukumEmail({
        asesorEmail: asesorHukum.email,
        asesorNama: asesorHukum.name,
        nomorPermohonan: updated.nomorPermohonan,
        trackingNumber: updated.trackingNumber,
        jadwalPemeriksaanHukum: updated.timAsesmen.jadwalPemeriksaanHukum,
        jadwalPleno: updated.timAsesmen.jadwalPleno,
        lokasiPemeriksaan: updated.timAsesmen.lokasiPemeriksaan,
        sekretariatNama: req.user!.name,
        terperiksa: updated.terperiksa,
        perkara: updated.perkara,
      }).catch((err) => {
        console.error('❌ Gagal mengirim notifikasi email penugasan hukum:', err);
      });
    }

    // Kirim Surat Jawaban (PDF) ke email Pengaju - sekali saja saat berkas masuk Step 4 (non-blocking)
    kirimSuratJawabanKePengaju(id)
      .then(async (result) => {
        if (result.sent) {
          await logAudit({
            actorId: req.user!.id,
            actorNama: req.user!.name,
            actorPeran: req.user!.role,
            permohonanId: id,
            aksi: 'KIRIM_SURAT_JAWABAN',
            rincian: `Surat jawaban (PDF) dikirim ke email pengaju: ${result.email}`,
          });
        } else if (!result.skipped) {
          console.warn('⚠️ Surat jawaban tidak terkirim:', result.reason);
        }
      })
      .catch((err) => {
        console.error('❌ Gagal mengirim surat jawaban ke pengaju:', err);
      });

    sendSuccess(res, updated, 'Tim asesmen berhasil ditugaskan');
  } catch (err) {
    next(err);
  }
};
