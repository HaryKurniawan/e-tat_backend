import { Request, Response, NextFunction } from 'express';
import { DimensiASAM } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { saveKriteriaPlasemenSchema } from '../asesmen-medis.schema';
import { getParam } from '../../../utils/param.util';

/**
 * Menyimpan / Memperbarui Instrumen Kriteria Penempatan (ASAM 6 Dimensi)
 */
export const saveKriteriaPlasemen = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const user = req.user!;
    const body = saveKriteriaPlasemenSchema.parse(req.body);

    const asesmenMedis = await prisma.asesmenMedis.findUnique({
      where: { permohonanId },
    });

    if (!asesmenMedis) {
      sendNotFound(res, 'Asesmen medis belum diisi. Buat asesmen medis terlebih dahulu.');
      return;
    }

    // Upsert Instrumen
    const instrumen = await prisma.instrumenKriteriaPlasemen.upsert({
      where: { permohonanId },
      create: {
        permohonanId,
        asesmenMedisId: asesmenMedis.id,
        petugasNama: user.name,
        petugasInstansi: user.agency || 'BNNP / Tim Medis TAT',
        wawancaraTambahanDilakukan: body.wawancaraTambahanDilakukan,
        catatanWawancara: body.catatanWawancara,
        levelRekomendasiAkhir: body.levelRekomendasiAkhir,
        justifikasiRekomendasi: body.justifikasiRekomendasi,
        adaDisparitasDimensi: body.adaDisparitasDimensi,
        catatanDisparitas: body.catatanDisparitas,
        statusPengisian: 'lengkap',
      },
      update: {
        petugasNama: user.name,
        petugasInstansi: user.agency || 'BNNP / Tim Medis TAT',
        wawancaraTambahanDilakukan: body.wawancaraTambahanDilakukan,
        catatanWawancara: body.catatanWawancara,
        levelRekomendasiAkhir: body.levelRekomendasiAkhir,
        justifikasiRekomendasi: body.justifikasiRekomendasi,
        adaDisparitasDimensi: body.adaDisparitasDimensi,
        catatanDisparitas: body.catatanDisparitas,
        statusPengisian: 'lengkap',
      },
    });

    // Replace 6 dimensi
    await prisma.penilaianDimensiASAM.deleteMany({
      where: { instrumenId: instrumen.id },
    });

    await prisma.penilaianDimensiASAM.createMany({
      data: body.penilaianPerDimensi.map((d) => ({
        instrumenId: instrumen.id,
        dimensi: d.dimensi as DimensiASAM,
        levelDipilih: d.levelDipilih,
        catatanKlinis: d.catatanKlinis,
        indikatorTerpilih: d.indikatorTerpilih,
      })),
    });

    const result = await prisma.instrumenKriteriaPlasemen.findUnique({
      where: { id: instrumen.id },
      include: {
        penilaianPerDimensi: true,
      },
    });

    sendSuccess(res, result, 'Instrumen kriteria penempatan (ASAM) berhasil disimpan');
  } catch (err) {
    next(err);
  }
};
