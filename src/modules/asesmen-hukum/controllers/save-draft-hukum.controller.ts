import { Request, Response, NextFunction } from 'express';
import { AssessmentStatus, AnalisisPeran, RekomendasiHukum } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { saveAsesmenHukumSchema } from '../asesmen-hukum.schema';
import { getParam } from '../../../utils/param.util';

function normalizeAnalisisPeran(val?: string): AnalisisPeran {
  if (!val) return AnalisisPeran.Belum_Dapat_Disimpulkan;
  const clean = val.replace(/\s+/g, '_').replace(/\//g, '');
  if (clean.includes('Penyalahguna_Murni') || clean.includes('Penyalahguna')) return AnalisisPeran.Penyalahguna_Murni;
  if (clean.includes('Korban')) return AnalisisPeran.Korban_Penyalahgunaan;
  if (clean.includes('Pecandu')) return AnalisisPeran.Pecandu_dengan_Kepemilikan_Terbatas;
  if (clean.includes('Pengedar') || clean.includes('Jaringan')) return AnalisisPeran.Indikasi_Pengedar_Jaringan;
  return AnalisisPeran.Belum_Dapat_Disimpulkan;
}

function normalizeRekomendasiHukum(val?: string): RekomendasiHukum | undefined {
  if (!val) return undefined;
  const clean = val.replace(/\s+/g, '_').replace(/\//g, '');
  if (clean.includes('Rehabilitasi') || clean.includes('Lanjut_Peradilan_Rehab')) return RekomendasiHukum.Proses_Hukum_Dilanjutkan_dengan_Rehabilitasi;
  if (clean.includes('Tanpa_Rehabilitasi') || clean.includes('Proses_Hukum_Murni')) return RekomendasiHukum.Proses_Hukum_Dilanjutkan_Tanpa_Rehabilitasi;
  if (clean.includes('Restoratif') || clean.includes('Diversi')) return RekomendasiHukum.Penerapan_Keadilan_Restoratif_Diversi;
  if (clean.includes('Pendalaman')) return RekomendasiHukum.Perlu_Pendalaman_Penyidikan;
  return RekomendasiHukum.Proses_Hukum_Dilanjutkan_dengan_Rehabilitasi;
}

/**
 * Menyimpan atau memperbarui draf Asesmen Hukum
 */
export const saveDraftHukum = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const user = req.user!;
    const body = saveAsesmenHukumSchema.parse(req.body);

    const existingPermohonan = await prisma.permohonanAsesmen.findUnique({
      where: { id: permohonanId },
    });

    if (!existingPermohonan) {
      sendNotFound(res, 'Permohonan tidak ditemukan');
      return;
    }

    const roleAnalisis = normalizeAnalisisPeran(body.analisisPeran);
    const hukumRekomendasi = normalizeRekomendasiHukum(body.rekomendasiHukum);

    const asesmen = await prisma.asesmenHukum.upsert({
      where: { permohonanId },
      create: {
        permohonanId,
        asesorId: user.id,
        asesorNama: user.name,
        status: AssessmentStatus.DRAFT,
        pernahDitangkap: body.pernahDitangkap,
        keteranganPerkaraLalu: body.keteranganPerkaraLalu,
        terverifikasiDatabase: body.terverifikasiDatabase,
        analisisPeran: roleAnalisis,
        argumentasiPeran: body.argumentasiPeran,
        faktaPendukung: body.faktaPendukung,
        catatanBelumTerverifikasi: body.catatanBelumTerverifikasi,
        analisisBarangBukti: body.analisisBarangBukti,
        kesimpulanHukum: body.kesimpulanHukum,
        rekomendasiHukum: hukumRekomendasi,
        catatanKlarifikasi: body.catatanKlarifikasi,
      },
      update: {
        pernahDitangkap: body.pernahDitangkap,
        keteranganPerkaraLalu: body.keteranganPerkaraLalu,
        terverifikasiDatabase: body.terverifikasiDatabase,
        analisisPeran: roleAnalisis,
        argumentasiPeran: body.argumentasiPeran,
        faktaPendukung: body.faktaPendukung,
        catatanBelumTerverifikasi: body.catatanBelumTerverifikasi,
        analisisBarangBukti: body.analisisBarangBukti,
        kesimpulanHukum: body.kesimpulanHukum,
        rekomendasiHukum: hukumRekomendasi,
        catatanKlarifikasi: body.catatanKlarifikasi,
      },
    });

    // Update status permohonan legalStatus
    await prisma.permohonanAsesmen.update({
      where: { id: permohonanId },
      data: { legalStatus: AssessmentStatus.DRAFT },
    });

    sendSuccess(res, asesmen, 'Draf asesmen hukum berhasil disimpan');
  } catch (err) {
    next(err);
  }
};
