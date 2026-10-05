import { Request, Response, NextFunction } from 'express';
import { StatusPengesah } from '@prisma/client';
import prisma from '../../../config/database';
import { sendCreated } from '../../../utils/response.util';
import { draftRekomendasiSchema } from '../rekomendasi.schema';
import { generateNomorRekomendasi, generateQrCodeString } from '../../../utils/nomor.util';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * Membuat draf Surat Rekomendasi Resmi
 */
export const createDraftRekomendasi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const user = req.user!;
    const body = draftRekomendasiSchema.parse(req.body);

    const nomorSurat = body.nomorSurat || (await generateNomorRekomendasi());
    const qrCode = generateQrCodeString('REK', nomorSurat);

    // Upsert Rekomendasi
    const rekomendasi = await prisma.rekomendasiResmi.upsert({
      where: { permohonanId },
      create: {
        permohonanId,
        nomorSurat,
        dibuatOleh: user.name,
        ringkasanMedis: body.ringkasanMedis,
        ringkasanHukum: body.ringkasanHukum,
        rekomendasiFinalText: body.rekomendasiFinalText,
        qrVerificationCode: qrCode,
      },
      update: {
        nomorSurat,
        ringkasanMedis: body.ringkasanMedis,
        ringkasanHukum: body.ringkasanHukum,
        rekomendasiFinalText: body.rekomendasiFinalText,
      },
    });

    // Replace daftar pengesah
    await prisma.pengesahDokumen.deleteMany({
      where: { rekomendasiId: rekomendasi.id },
    });

    await prisma.pengesahDokumen.createMany({
      data: body.daftarPengesah.map((dp) => ({
        rekomendasiId: rekomendasi.id,
        nama: dp.nama,
        jabatan: dp.jabatan,
        instansi: dp.instansi,
        status: StatusPengesah.menunggu,
      })),
    });

    const result = await prisma.rekomendasiResmi.findUnique({
      where: { id: rekomendasi.id },
      include: { daftarPengesah: true },
    });

    await logAudit({
      permohonanId,
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      aksi: 'BUAT_DRAFT_REKOMENDASI',
      rincian: `Draf rekomendasi resmi dibuat dengan No: ${nomorSurat}`,
    });

    sendCreated(res, result, 'Draf rekomendasi resmi berhasil dibuat');
  } catch (err) {
    next(err);
  }
};
