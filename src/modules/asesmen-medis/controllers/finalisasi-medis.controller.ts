import { Request, Response, NextFunction } from 'express';
import { AssessmentStatus } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';
import { sendNotifikasiMedisSelesaiKeHukumEmail } from '../../../services/email.service';

/**
 * Finalisasi Asesmen Medis
 */
export const finalisasiMedis = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const user = req.user!;

    const asesmen = await prisma.asesmenMedis.findUnique({
      where: { permohonanId },
    });

    if (!asesmen) {
      sendNotFound(res, 'Asesmen medis belum diisi');
      return;
    }

    const updated = await prisma.asesmenMedis.update({
      where: { permohonanId },
      data: {
        status: AssessmentStatus.FINAL,
        finalizedAt: new Date(),
        finalizedBy: user.name,
      },
      include: {
        hasilUrin: true,
        riwayatZat: true,
      },
    });

    // Update Permohonan medicalStatus
    const permohonan = await prisma.permohonanAsesmen.update({
      where: { id: permohonanId },
      data: { medicalStatus: AssessmentStatus.FINAL },
      include: {
        timAsesmen: {
          include: {
            asesorHukum: true,
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

    // Audit log
    await logAudit({
      permohonanId,
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      aksi: 'FINALISASI_ASESMEN_MEDIS',
      rincian: `Asesmen medis telah difinalisasi oleh ${user.name}`,
    });

    // Kirim notifikasi email ke Asesor Hukum bahwa asesmen medis telah selesai difinalisasi
    if (permohonan.timAsesmen?.asesorHukum?.email && permohonan.terperiksa) {
      const asesorHukum = permohonan.timAsesmen.asesorHukum;
      const tesUrinStr = updated.hasilUrin && updated.hasilUrin.length > 0
        ? updated.hasilUrin.map((u) => `${u.parameter}: ${u.hasil}`).join(', ')
        : 'Terlampir di Rekam Medis';
      const zatList = updated.riwayatZat?.map((r) => r.jenisZat) || [];

      sendNotifikasiMedisSelesaiKeHukumEmail({
        asesorHukumEmail: asesorHukum.email,
        asesorHukumNama: asesorHukum.name,
        asesorMedisNama: user.name,
        nomorPermohonan: permohonan.nomorPermohonan,
        trackingNumber: permohonan.trackingNumber,
        jadwalPemeriksaanHukum: permohonan.timAsesmen.jadwalPemeriksaanHukum,
        jadwalPleno: permohonan.timAsesmen.jadwalPleno,
        lokasiPemeriksaan: permohonan.timAsesmen.lokasiPemeriksaan,
        terperiksa: permohonan.terperiksa,
        perkara: permohonan.perkara,
        hasilMedis: {
          tesUrinHasil: tesUrinStr,
          tesUrinZat: zatList,
          diagnosisNapza: updated.diagnosisKlinisIcd || updated.interpretasiKlinis || '-',
          tingkatKetergantungan: updated.tingkatRisikoInstrumen || '-',
          rekomendasiRehab: updated.kebutuhanRawat ? `${updated.kebutuhanRawat}${updated.durasiUsulanBulan ? ` (${updated.durasiUsulanBulan} Bulan)` : ''}` : '-',
          rencanaTerapi: updated.catatanKhusus || updated.interpretasiKlinis || '-',
        },
      }).catch((err) => {
        console.error('❌ Gagal mengirim notifikasi medis selesai ke Asesor Hukum:', err);
      });
    }

    sendSuccess(res, updated, 'Asesmen medis berhasil difinalisasi');
  } catch (err) {
    next(err);
  }
};
