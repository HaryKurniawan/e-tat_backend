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

    // Jika pleno selesai, update status permohonan ke AWAITING_SIGNED_OUTPUTS & inisialisasi RekomendasiResmi
    if (body.statusPleno === 'selesai_sepakat') {
      await prisma.permohonanAsesmen.update({
        where: { id: permohonanId },
        data: {
          applicationStatus: ApplicationStatus.AWAITING_SIGNED_OUTPUTS,
        },
      });

      // Otomatis terbitkan draf Rekomendasi Resmi jika belum ada
      const existingRek = await prisma.rekomendasiResmi.findUnique({
        where: { permohonanId },
        include: { daftarPengesah: true },
      });

      if (!existingRek) {
        const { generateNomorRekomendasi, generateQrCodeString } = await import('../../../utils/nomor.util');
        const nomorSurat = await generateNomorRekomendasi();
        const qrCode = generateQrCodeString('REK', nomorSurat);

        const permohonanDetail = await prisma.permohonanAsesmen.findUnique({
          where: { id: permohonanId },
          include: { asesmenMedis: true, asesmenHukum: true },
        });

        const ringkasanMedis = permohonanDetail?.asesmenMedis?.diagnosisKlinisIcd
          ? `Diagnosis ICD-10: ${permohonanDetail.asesmenMedis.diagnosisKlinisIcd}. Kebutuhan Rawat: ${permohonanDetail.asesmenMedis.kebutuhanRawat || 'Rawat Inap'}.`
          : 'Pemeriksaan medis menunjukkan ketergantungan narkotika yang memerlukan rehabilitasi.';

        const ringkasanHukum = permohonanDetail?.asesmenHukum?.analisisPeran
          ? `Analisis Peran: ${permohonanDetail.asesmenHukum.analisisPeran}. Rekomendasi: ${permohonanDetail.asesmenHukum.rekomendasiHukum || 'Rehabilitasi Medis dan Sosial'}.`
          : 'Subjek terbukti sebagai penyalahguna murni dan bukan bagian dari jaringan peredaran gelap narkotika.';

        const newRek = await prisma.rekomendasiResmi.create({
          data: {
            permohonanId,
            nomorSurat,
            dibuatOleh: user.name,
            ringkasanMedis,
            ringkasanHukum,
            rekomendasiFinalText: body.kesepakatanRekomendasi || 'REHABILITASI MEDIS DAN SOSIAL',
            qrVerificationCode: qrCode,
            daftarPengesah: {
              create: [
                {
                  nama: 'Kompol Arya Wicaksono, S.I.K.',
                  jabatan: 'Ketua Tim Asesmen Terpadu',
                  instansi: 'Polda Kalimantan Timur',
                  status: 'menunggu',
                },
                {
                  nama: 'dr. Ratna Sp.KJ',
                  jabatan: 'Asesor Medis',
                  instansi: 'BNNP Kalimantan Timur',
                  status: 'menunggu',
                },
                {
                  nama: 'Kompol Bambang Sutedjo, S.H.',
                  jabatan: 'Asesor Hukum Polri',
                  instansi: 'Ditresnarkoba Polda Kaltim',
                  status: 'menunggu',
                },
                {
                  nama: 'Agus Pratama, S.H., M.H.',
                  jabatan: 'Asesor Hukum Kejaksaan',
                  instansi: 'Kejaksaan Tinggi Kaltim',
                  status: 'menunggu',
                },
              ],
            },
          },
        });

        await logAudit({
          permohonanId,
          actorId: user.id,
          actorNama: user.name,
          actorPeran: user.role,
          aksi: 'BUAT_DRAFT_REKOMENDASI',
          rincian: `Draf rekomendasi resmi otomatis diinisialisasi dari Pleno dengan No: ${nomorSurat}`,
        });
      }
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
