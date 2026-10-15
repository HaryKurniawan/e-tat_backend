import { Request, Response, NextFunction } from 'express';
import { StatusPengesah, DeliveryStatus } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { tandaTanganRekomendasiSchema } from '../rekomendasi.schema';
import { generateSha256Hash } from '../../../utils/hash.util';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * Menandatangani (Digital Signature Hash) Pengesahan Dokumen
 */
export const prosesTandaTangan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const user = req.user!;
    const body = tandaTanganRekomendasiSchema.parse(req.body);

    let pengesah: any = await prisma.pengesahDokumen.findUnique({
      where: { id: body.pengesahId },
      include: { rekomendasi: true },
    });

    if (!pengesah) {
      let rek = await prisma.rekomendasiResmi.findUnique({
        where: { permohonanId },
        include: { daftarPengesah: true }
      });

      if (!rek) {
        const noSurat = `TAT/REK/${Date.now().toString().slice(-6)}/${new Date().getFullYear()}`;
        rek = await prisma.rekomendasiResmi.create({
          data: {
            permohonanId,
            nomorSurat: noSurat,
            dibuatOleh: user.name,
            rekomendasiFinalText: 'Rekomendasi Terpadu Tim Asesmen Terpadu (TAT)',
            qrVerificationCode: `VERIF-QR-${noSurat}`,
            daftarPengesah: {
              create: [
                { nama: 'Kompol Arya Wicaksono, S.I.K.', jabatan: 'Ketua Tim TAT / Sekretariat', instansi: 'Polda Metro Jaya', status: StatusPengesah.menunggu },
                { nama: 'dr. Ratna Sp.KJ', jabatan: 'Dokter Asesor Medis TAT', instansi: 'BNNP DKI Jakarta', status: StatusPengesah.menunggu },
                { nama: 'Agus Pratama, S.H., M.H.', jabatan: 'Jaksa Penelaah Hukum TAT', instansi: 'Kejaksaan Tinggi DKI Jakarta', status: StatusPengesah.menunggu }
              ]
            }
          },
          include: { daftarPengesah: true }
        });
      }

      pengesah = rek.daftarPengesah.find(p => p.id === body.pengesahId) || null;
      if (!pengesah && rek.daftarPengesah.length > 0) {
        if (user.role === 'ADMIN') {
          pengesah = rek.daftarPengesah.find(p => p.jabatan.includes('Ketua') || p.jabatan.includes('Sekretariat')) || rek.daftarPengesah[0];
        } else if (user.role === 'MEDIS') {
          pengesah = rek.daftarPengesah.find(p => p.jabatan.includes('Medis') || p.jabatan.includes('Dokter')) || rek.daftarPengesah[1] || rek.daftarPengesah[0];
        } else if (user.role === 'HUKUM') {
          pengesah = rek.daftarPengesah.find(p => p.jabatan.includes('Hukum') || p.jabatan.includes('Jaksa')) || rek.daftarPengesah[2] || rek.daftarPengesah[0];
        } else {
          pengesah = rek.daftarPengesah[0];
        }
      }
    }

    if (!pengesah) {
      sendNotFound(res, 'Data pengesah tidak ditemukan');
      return;
    }

    const tgl = new Date();
    const signatureHash =
      body.status === 'disahkan'
        ? generateSha256Hash(
            `${pengesah.id}-${pengesah.nama}-${permohonanId}-${tgl.toISOString()}`
          )
        : null;

    await prisma.pengesahDokumen.update({
      where: { id: body.pengesahId },
      data: {
        status: body.status as StatusPengesah,
        tanggalPengesahan: tgl,
        catatanKoreksi: body.catatanKoreksi,
        tandaTanganDigitalHash: signatureHash,
      },
    });

    // Periksa apakah semua pengesah sudah menyetujui
    const allPengesah = await prisma.pengesahDokumen.findMany({
      where: { rekomendasiId: pengesah.rekomendasiId },
    });

    const isLengkap = allPengesah.every((p) => p.status === StatusPengesah.disahkan);

    if (isLengkap) {
      await prisma.rekomendasiResmi.update({
        where: { id: pengesah.rekomendasiId },
        data: {
          isLengkapPengesahan: true,
          tanggalTerbit: tgl,
        },
      });

      await prisma.permohonanAsesmen.update({
        where: { id: permohonanId },
        data: {
          applicationStatus: 'RESULTS_ISSUED',
          deliveryStatus: DeliveryStatus.ISSUED_NOT_DELIVERED,
        },
      });

      // Otomatis inisialisasi Tindak Lanjut Layanan jika belum ada
      const existingTL = await prisma.tindakLanjutLayanan.findUnique({
        where: { permohonanId },
      });

      if (!existingTL) {
        const permohonanWithPleno = await prisma.permohonanAsesmen.findUnique({
          where: { id: permohonanId },
          include: { sidangPleno: true, asesmenMedis: true },
        });

        const isRawatInap = permohonanWithPleno?.asesmenMedis?.kebutuhanRawat?.toLowerCase().includes('inap') ||
          permohonanWithPleno?.sidangPleno?.kesepakatanRekomendasi?.toLowerCase().includes('inap');

        const faskes = permohonanWithPleno?.sidangPleno?.fasilitasRujukanUsulan ||
          'Balai Rehabilitasi BNN Tanah Merah';

        await prisma.tindakLanjutLayanan.create({
          data: {
            permohonanId,
            jenisTindakLanjut: 'Rujukan_Rehabilitasi',
            namaFasilitasTujuan: faskes,
            kontakFasilitas: '(0541) 743211 / info@tanahmerah.bnn.go.id',
            statusRujukan: 'sedang_dikoordinasikan',
            tanggalRujukanDikirim: tgl,
            penanggungJawabTindakLanjut: 'Koordinator Tindak Lanjut & Rujukan TAT',
            statusProsesHukumTerkait: 'Penyidikan berjalan berkeadilan restoratif dengan rujukan rehabilitasi resmi.',
          },
        });
      }
    }

    const updatedRekomendasi = await prisma.rekomendasiResmi.findUnique({
      where: { id: pengesah.rekomendasiId },
      include: { daftarPengesah: true },
    });

    await logAudit({
      permohonanId,
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      aksi: 'PENGESAHAN_DOKUMEN',
      rincian: `Pengesahan oleh ${pengesah.nama} (${body.status})`,
    });

    sendSuccess(res, updatedRekomendasi, 'Persetujuan pengesah berhasil diproses');
  } catch (err) {
    next(err);
  }
};
