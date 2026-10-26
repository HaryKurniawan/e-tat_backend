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

    // Parsing optional body data jika dikirim bersamaan dengan finalisasi
    const body = req.body || {};
    const tandaBekasSuntikan = body.needleTracks
      ? body.needleTracks !== 'tidak_ada'
      : body.tandaBekasSuntikan;

    const dataPayload: any = {
      status: AssessmentStatus.FINAL,
      finalizedAt: new Date(),
      finalizedBy: user.name,
    };

    if (body.tekananDarah !== undefined) dataPayload.tekananDarah = body.tekananDarah;
    if (body.denyutNadi !== undefined) dataPayload.denyutNadi = body.denyutNadi ? Number(body.denyutNadi) : undefined;
    if (body.pernapasan !== undefined) dataPayload.pernapasan = body.pernapasan ? Number(body.pernapasan) : undefined;
    if (body.suhuTubuh !== undefined) dataPayload.suhuTubuh = body.suhuTubuh ? Number(body.suhuTubuh) : undefined;
    if (body.needleTracks !== undefined) dataPayload.needleTracks = body.needleTracks;
    if (body.kondisiIntoksikasi !== undefined) dataPayload.kondisiIntoksikasi = body.kondisiIntoksikasi;
    if (body.fasilitasRujukan !== undefined) dataPayload.fasilitasRujukan = body.fasilitasRujukan;
    if (tandaBekasSuntikan !== undefined) dataPayload.tandaBekasSuntikan = tandaBekasSuntikan;
    if (body.kondisiFisik !== undefined) dataPayload.kondisiFisik = body.kondisiFisik;
    if (body.komorbiditasMedis !== undefined) dataPayload.komorbiditasMedis = body.komorbiditasMedis;
    if (body.kondisiPsikologis !== undefined) dataPayload.kondisiPsikologis = body.kondisiPsikologis;
    if (body.instrumen !== undefined) dataPayload.instrumen = body.instrumen;
    if (body.skorInstrumen !== undefined) dataPayload.skorInstrumen = body.skorInstrumen ? Number(body.skorInstrumen) : undefined;
    if (body.tingkatRisikoInstrumen !== undefined) dataPayload.tingkatRisikoInstrumen = body.tingkatRisikoInstrumen;
    if (body.diagnosisKlinisIcd !== undefined) dataPayload.diagnosisKlinisIcd = body.diagnosisKlinisIcd;
    if (body.interpretasiKlinis !== undefined) dataPayload.interpretasiKlinis = body.interpretasiKlinis;
    if (body.kebutuhanRawat !== undefined) dataPayload.kebutuhanRawat = body.kebutuhanRawat;
    if (body.durasiUsulanBulan !== undefined) dataPayload.durasiUsulanBulan = body.durasiUsulanBulan ? Number(body.durasiUsulanBulan) : undefined;
    if (body.catatanKhusus !== undefined) dataPayload.catatanKhusus = body.catatanKhusus;

    const updated = await prisma.asesmenMedis.upsert({
      where: { permohonanId },
      create: {
        permohonanId,
        asesorId: user.id,
        asesorNama: user.name,
        ...dataPayload,
      },
      update: dataPayload,
      include: {
        hasilUrin: true,
        riwayatZat: true,
      },
    });

    if (body.riwayatZat && Array.isArray(body.riwayatZat) && body.riwayatZat.length > 0) {
      await prisma.riwayatZat.deleteMany({ where: { asesmenMedisId: updated.id } });
      await prisma.riwayatZat.createMany({
        data: body.riwayatZat.map((rz: any) => ({
          asesmenMedisId: updated.id,
          jenisZat: rz.jenisZat,
          caraPakai: rz.caraPakai,
          frekuensi: rz.frekuensi,
          lamaPemakaianBulan: rz.lamaPemakaianBulan ? Number(rz.lamaPemakaianBulan) : undefined,
          terakhirPakai: rz.terakhirPakai,
        })),
      });
    }

    if (body.hasilUrin && Array.isArray(body.hasilUrin) && body.hasilUrin.length > 0) {
      await prisma.hasilUrin.deleteMany({ where: { asesmenMedisId: updated.id } });
      await prisma.hasilUrin.createMany({
        data: body.hasilUrin.map((hu: any) => ({
          asesmenMedisId: updated.id,
          parameter: hu.parameter,
          hasil: hu.hasil,
        })),
      });
    }

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
