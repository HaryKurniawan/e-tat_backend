import { Request, Response, NextFunction } from 'express';
import { AssessmentStatus } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { saveAsesmenMedisSchema } from '../asesmen-medis.schema';
import { getParam } from '../../../utils/param.util';

/**
 * Menyimpan / memperbarui draf Asesmen Medis
 */
export const saveDraftMedis = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const user = req.user!;
    const body = saveAsesmenMedisSchema.parse(req.body);

    const existingPermohonan = await prisma.permohonanAsesmen.findUnique({
      where: { id: permohonanId },
    });

    if (!existingPermohonan) {
      sendNotFound(res, 'Permohonan tidak ditemukan');
      return;
    }

    const tandaBekasSuntikan = body.needleTracks
      ? body.needleTracks !== 'tidak_ada'
      : body.tandaBekasSuntikan;
    const vitalExtra = {
      pernapasan: body.pernapasan,
      suhuTubuh: body.suhuTubuh,
      needleTracks: body.needleTracks,
      kondisiIntoksikasi: body.kondisiIntoksikasi,
      fasilitasRujukan: body.fasilitasRujukan,
    };

    const asesmen = await prisma.asesmenMedis.upsert({
      where: { permohonanId },
      create: {
        permohonanId,
        asesorId: user.id,
        asesorNama: user.name,
        status: AssessmentStatus.DRAFT,
        kondisiFisik: body.kondisiFisik,
        tekananDarah: body.tekananDarah,
        denyutNadi: body.denyutNadi,
        ...vitalExtra,
        tandaBekasSuntikan,
        komorbiditasMedis: body.komorbiditasMedis,
        kondisiPsikologis: body.kondisiPsikologis,
        instrumen: body.instrumen,
        skorInstrumen: body.skorInstrumen,
        tingkatRisikoInstrumen: body.tingkatRisikoInstrumen,
        diagnosisKlinisIcd: body.diagnosisKlinisIcd,
        interpretasiKlinis: body.interpretasiKlinis,
        kebutuhanRawat: body.kebutuhanRawat,
        durasiUsulanBulan: body.durasiUsulanBulan,
        catatanKhusus: body.catatanKhusus,
        permintaanPemeriksaanTambahan: body.permintaanPemeriksaanTambahan,
      },
      update: {
        kondisiFisik: body.kondisiFisik,
        tekananDarah: body.tekananDarah,
        denyutNadi: body.denyutNadi,
        ...vitalExtra,
        tandaBekasSuntikan,
        komorbiditasMedis: body.komorbiditasMedis,
        kondisiPsikologis: body.kondisiPsikologis,
        instrumen: body.instrumen,
        skorInstrumen: body.skorInstrumen,
        tingkatRisikoInstrumen: body.tingkatRisikoInstrumen,
        diagnosisKlinisIcd: body.diagnosisKlinisIcd,
        interpretasiKlinis: body.interpretasiKlinis,
        kebutuhanRawat: body.kebutuhanRawat,
        durasiUsulanBulan: body.durasiUsulanBulan,
        catatanKhusus: body.catatanKhusus,
        permintaanPemeriksaanTambahan: body.permintaanPemeriksaanTambahan,
      },
    });

    await prisma.permohonanAsesmen.update({
      where: { id: permohonanId },
      data: { medicalStatus: AssessmentStatus.DRAFT },
    });

    if (body.riwayatZat) {
      await prisma.riwayatZat.deleteMany({
        where: { asesmenMedisId: asesmen.id },
      });
      if (body.riwayatZat.length > 0) {
        await prisma.riwayatZat.createMany({
          data: body.riwayatZat.map((rz) => ({
            asesmenMedisId: asesmen.id,
            jenisZat: rz.jenisZat,
            caraPakai: rz.caraPakai,
            frekuensi: rz.frekuensi,
            lamaPemakaianBulan: rz.lamaPemakaianBulan,
            terakhirPakai: rz.terakhirPakai,
          })),
        });
      }
    }

    if (body.hasilUrin) {
      await prisma.hasilUrin.deleteMany({
        where: { asesmenMedisId: asesmen.id },
      });
      if (body.hasilUrin.length > 0) {
        await prisma.hasilUrin.createMany({
          data: body.hasilUrin.map((hu) => ({
            asesmenMedisId: asesmen.id,
            parameter: hu.parameter,
            hasil: hu.hasil,
          })),
        });
      }
    }

    const updated = await prisma.asesmenMedis.findUnique({
      where: { id: asesmen.id },
      include: {
        riwayatZat: true,
        hasilUrin: true,
      },
    });

    sendSuccess(res, updated, 'Draf asesmen medis berhasil disimpan');
  } catch (err) {
    next(err);
  }
};
