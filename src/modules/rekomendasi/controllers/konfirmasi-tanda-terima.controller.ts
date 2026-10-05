import { Request, Response, NextFunction } from 'express';
import { DeliveryStatus } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { tandaTerimaPengajuSchema } from '../rekomendasi.schema';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * Konfirmasi Tanda Terima oleh Pengaju / Penyidik
 */
export const konfirmasiTandaTerima = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const user = req.user!;
    const body = tandaTerimaPengajuSchema.parse(req.body);

    const rekomendasi = await prisma.rekomendasiResmi.findUnique({
      where: { permohonanId },
    });

    if (!rekomendasi) {
      sendNotFound(res, 'Rekomendasi resmi belum ada');
      return;
    }

    const tgl = new Date();
    const updated = await prisma.rekomendasiResmi.update({
      where: { permohonanId },
      data: {
        buktPenerimaanDiterimaOleh: body.diterimaOleh,
        buktiPenerimaanTanggal: tgl,
        buktiPenerimaanNomorTandaTerima:
          body.nomorTandaTerima || `TT-TAT/${Date.now().toString().slice(-6)}`,
      },
    });

    await prisma.permohonanAsesmen.update({
      where: { id: permohonanId },
      data: {
        deliveryStatus: DeliveryStatus.DELIVERED,
      },
    });

    await logAudit({
      permohonanId,
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      aksi: 'KONFIRMASI_TANDA_TERIMA',
      rincian: `Rekomendasi diterima oleh ${body.diterimaOleh}`,
    });

    sendSuccess(res, updated, 'Tanda terima berhasil dikonfirmasi');
  } catch (err) {
    next(err);
  }
};
