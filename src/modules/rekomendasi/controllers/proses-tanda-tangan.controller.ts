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

    const pengesah = await prisma.pengesahDokumen.findUnique({
      where: { id: body.pengesahId },
      include: { rekomendasi: true },
    });

    if (!pengesah || pengesah.rekomendasi.permohonanId !== permohonanId) {
      sendNotFound(res, 'Data pengesah tidak ditemukan');
      return;
    }

    const tgl = new Date();
    const signatureHash =
      body.status === 'disahkan'
        ? generateSha256Hash(
            `${pengesah.id}-${pengesah.nama}-${pengesah.rekomendasi.nomorSurat}-${tgl.toISOString()}`
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
          deliveryStatus: DeliveryStatus.ISSUED_NOT_DELIVERED,
        },
      });
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
