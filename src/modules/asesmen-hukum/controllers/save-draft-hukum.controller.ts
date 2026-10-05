import { Request, Response, NextFunction } from 'express';
import { AssessmentStatus, AnalisisPeran, RekomendasiHukum } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { saveAsesmenHukumSchema } from '../asesmen-hukum.schema';
import { getParam } from '../../../utils/param.util';

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
        analisisPeran: body.analisisPeran as AnalisisPeran,
        argumentasiPeran: body.argumentasiPeran,
        faktaPendukung: body.faktaPendukung,
        catatanBelumTerverifikasi: body.catatanBelumTerverifikasi,
        analisisBarangBukti: body.analisisBarangBukti,
        kesimpulanHukum: body.kesimpulanHukum,
        rekomendasiHukum: body.rekomendasiHukum as RekomendasiHukum | undefined,
        catatanKlarifikasi: body.catatanKlarifikasi,
      },
      update: {
        pernahDitangkap: body.pernahDitangkap,
        keteranganPerkaraLalu: body.keteranganPerkaraLalu,
        terverifikasiDatabase: body.terverifikasiDatabase,
        analisisPeran: body.analisisPeran as AnalisisPeran,
        argumentasiPeran: body.argumentasiPeran,
        faktaPendukung: body.faktaPendukung,
        catatanBelumTerverifikasi: body.catatanBelumTerverifikasi,
        analisisBarangBukti: body.analisisBarangBukti,
        kesimpulanHukum: body.kesimpulanHukum,
        rekomendasiHukum: body.rekomendasiHukum as RekomendasiHukum | undefined,
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
