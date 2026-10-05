import { Request, Response, NextFunction } from 'express';
import {
  FollowupStatus,
  JenisTindakLanjut,
  StatusRujukan,
} from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess } from '../../../utils/response.util';
import { updateTindakLanjutSchema } from '../tindak-lanjut.schema';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * Menyimpan / memperbarui data Tindak Lanjut Layanan
 */
export const saveTindakLanjut = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const user = req.user!;
    const body = updateTindakLanjutSchema.parse(req.body);

    const tl = await prisma.tindakLanjutLayanan.upsert({
      where: { permohonanId },
      create: {
        permohonanId,
        jenisTindakLanjut: body.jenisTindakLanjut as JenisTindakLanjut,
        namaFasilitasTujuan: body.namaFasilitasTujuan,
        kontakFasilitas: body.kontakFasilitas,
        statusRujukan: body.statusRujukan as StatusRujukan,
        tanggalRujukanDikirim: body.tanggalRujukanDikirim ? new Date(body.tanggalRujukanDikirim) : null,
        tanggalKonfirmasiFasilitas: body.tanggalKonfirmasiFasilitas
          ? new Date(body.tanggalKonfirmasiFasilitas)
          : null,
        tanggalMulaiLayanan: body.tanggalMulaiLayanan ? new Date(body.tanggalMulaiLayanan) : null,
        hambatanPelaksanaan: body.hambatanPelaksanaan,
        penanggungJawabTindakLanjut: body.penanggungJawabTindakLanjut || user.name,
        statusProsesHukumTerkait: body.statusProsesHukumTerkait,
      },
      update: {
        jenisTindakLanjut: body.jenisTindakLanjut as JenisTindakLanjut,
        namaFasilitasTujuan: body.namaFasilitasTujuan,
        kontakFasilitas: body.kontakFasilitas,
        statusRujukan: body.statusRujukan as StatusRujukan,
        tanggalRujukanDikirim: body.tanggalRujukanDikirim ? new Date(body.tanggalRujukanDikirim) : null,
        tanggalKonfirmasiFasilitas: body.tanggalKonfirmasiFasilitas
          ? new Date(body.tanggalKonfirmasiFasilitas)
          : null,
        tanggalMulaiLayanan: body.tanggalMulaiLayanan ? new Date(body.tanggalMulaiLayanan) : null,
        hambatanPelaksanaan: body.hambatanPelaksanaan,
        penanggungJawabTindakLanjut: body.penanggungJawabTindakLanjut || user.name,
        statusProsesHukumTerkait: body.statusProsesHukumTerkait,
      },
    });

    // Inisiasi monitoring jika belum ada
    await prisma.monitoringTindakLanjut.upsert({
      where: { permohonanId },
      create: {
        permohonanId,
        dibuatOleh: user.name,
      },
      update: {},
    });

    // Update followup status di permohonan
    await prisma.permohonanAsesmen.update({
      where: { id: permohonanId },
      data: {
        followupStatus:
          body.statusRujukan === 'klien_mulai_layanan'
            ? FollowupStatus.REPORTED_PENDING_VERIFICATION
            : FollowupStatus.NOT_YET_REPORTED,
      },
    });

    await logAudit({
      permohonanId,
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      aksi: 'UPDATE_TINDAK_LANJUT',
      rincian: `Pembaruan status tindak lanjut: ${body.statusRujukan}`,
    });

    sendSuccess(res, tl, 'Data tindak lanjut berhasil diperbarui');
  } catch (err) {
    next(err);
  }
};
