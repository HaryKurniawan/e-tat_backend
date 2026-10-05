import { Request, Response, NextFunction } from 'express';
import { StatusPleno, JenisRekomendasiFinal, ApplicationStatus } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess } from '../../../utils/response.util';
import { hasilPlenoSchema } from '../sidang-pleno.schema';
import { generateNomorBeritaAcara } from '../../../utils/nomor.util';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * Menyimpan Notula dan Kesepakatan Hasil Sidang Pleno
 */
export const simpanHasilPleno = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const user = req.user!;
    const body = hasilPlenoSchema.parse(req.body);

    const plenoExisting = await prisma.sidangPleno.findUnique({
      where: { permohonanId },
    });

    let nomorBA = body.nomorBeritaAcara;
    if (!nomorBA && (!plenoExisting || !plenoExisting.nomorBeritaAcara)) {
      nomorBA = await generateNomorBeritaAcara();
    } else if (!nomorBA && plenoExisting) {
      nomorBA = plenoExisting.nomorBeritaAcara || (await generateNomorBeritaAcara());
    }

    const pleno = await prisma.sidangPleno.upsert({
      where: { permohonanId },
      create: {
        permohonanId,
        tanggalPleno: new Date(),
        nomorBeritaAcara: nomorBA,
        pokokBahasan: body.pokokBahasan,
        catatanPerbedaanPendapat: body.catatanPerbedaanPendapat,
        kesepakatanRekomendasi: body.kesepakatanRekomendasi,
        jenisRekomendasiFinal: body.jenisRekomendasiFinal as JenisRekomendasiFinal,
        durasiRehabBulan: body.durasiRehabBulan,
        fasilitasRujukanUsulan: body.fasilitasRujukanUsulan,
        statusPleno: body.statusPleno as StatusPleno,
      },
      update: {
        nomorBeritaAcara: nomorBA,
        pokokBahasan: body.pokokBahasan,
        catatanPerbedaanPendapat: body.catatanPerbedaanPendapat,
        kesepakatanRekomendasi: body.kesepakatanRekomendasi,
        jenisRekomendasiFinal: body.jenisRekomendasiFinal as JenisRekomendasiFinal,
        durasiRehabBulan: body.durasiRehabBulan,
        fasilitasRujukanUsulan: body.fasilitasRujukanUsulan,
        statusPleno: body.statusPleno as StatusPleno,
      },
    });

    // Simpan daftar hadir jika disertakan
    if (body.daftarHadir && body.daftarHadir.length > 0) {
      await prisma.daftarHadirPleno.deleteMany({
        where: { sidangPlenoId: pleno.id },
      });

      await prisma.daftarHadirPleno.createMany({
        data: body.daftarHadir.map((dh) => ({
          sidangPlenoId: pleno.id,
          nama: dh.nama,
          peran: dh.peran,
          instansi: dh.instansi,
          hadir: dh.hadir,
        })),
      });
    }

    // Jika pleno selesai, update status permohonan
    if (body.statusPleno === 'selesai_sepakat') {
      await prisma.permohonanAsesmen.update({
        where: { id: permohonanId },
        data: {
          applicationStatus: ApplicationStatus.RESULTS_ISSUED,
        },
      });
    }

    const result = await prisma.sidangPleno.findUnique({
      where: { id: pleno.id },
      include: { daftarHadir: true },
    });

    await logAudit({
      permohonanId,
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      aksi: 'SIMPAN_HASIL_PLENO',
      rincian: `Hasil sidang pleno dicatat dengan BA: ${nomorBA}`,
    });

    sendSuccess(res, result, 'Hasil sidang pleno berhasil disimpan');
  } catch (err) {
    next(err);
  }
};
