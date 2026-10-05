import { Request, Response, NextFunction } from 'express';
import { StatusPelaksanaanRehab } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess } from '../../../utils/response.util';
import { updatePelaksanaanRehabSchema } from '../tindak-lanjut.schema';
import { getParam } from '../../../utils/param.util';

/**
 * Update koordinasi dan serah terima pelaksanaan rehabilitasi
 */
export const updatePelaksanaan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const user = req.user!;
    const body = updatePelaksanaanRehabSchema.parse(req.body);

    let monitoring = await prisma.monitoringTindakLanjut.findUnique({
      where: { permohonanId },
    });

    if (!monitoring) {
      monitoring = await prisma.monitoringTindakLanjut.create({
        data: {
          permohonanId,
          dibuatOleh: user.name,
        },
      });
    }

    const pelaksanaan = await prisma.pelaksanaanRehab.upsert({
      where: { monitoringId: monitoring.id },
      create: {
        monitoringId: monitoring.id,
        namaFasilitasTujuan: body.namaFasilitasTujuan,
        alamatFasilitas: body.alamatFasilitas,
        kontakPenanggungJawabFasilitas: body.kontakPenanggungJawabFasilitas,
        namaPenanggungJawabFasilitas: body.namaPenanggungJawabFasilitas,
        tanggalKoordinasiPenerimaan: body.tanggalKoordinasiPenerimaan
          ? new Date(body.tanggalKoordinasiPenerimaan)
          : null,
        hasilKoordinasiPenerimaan: body.hasilKoordinasiPenerimaan,
        catatanKoordinasi: body.catatanKoordinasi,
        tanggalSerahTerimaAktual: body.tanggalSerahTerimaAktual
          ? new Date(body.tanggalSerahTerimaAktual)
          : null,
        identitasPihakMenyerahkan: body.identitasPihakMenyerahkan,
        identitasPihakMenerima: body.identitasPihakMenerima,
        tanggalMasukLayananTerkonfirmasi: body.tanggalMasukLayananTerkonfirmasi
          ? new Date(body.tanggalMasukLayananTerkonfirmasi)
          : null,
        adaKendala: body.adaKendala,
        kendala: body.kendala,
        perbedaanDariRekomendasi: body.perbedaanDariRekomendasi,
        statusPelaksanaan: body.statusPelaksanaan as StatusPelaksanaanRehab,
        diisiOleh: user.name,
        tanggalDiisi: new Date(),
      },
      update: {
        namaFasilitasTujuan: body.namaFasilitasTujuan,
        alamatFasilitas: body.alamatFasilitas,
        kontakPenanggungJawabFasilitas: body.kontakPenanggungJawabFasilitas,
        namaPenanggungJawabFasilitas: body.namaPenanggungJawabFasilitas,
        tanggalKoordinasiPenerimaan: body.tanggalKoordinasiPenerimaan
          ? new Date(body.tanggalKoordinasiPenerimaan)
          : null,
        hasilKoordinasiPenerimaan: body.hasilKoordinasiPenerimaan,
        catatanKoordinasi: body.catatanKoordinasi,
        tanggalSerahTerimaAktual: body.tanggalSerahTerimaAktual
          ? new Date(body.tanggalSerahTerimaAktual)
          : null,
        identitasPihakMenyerahkan: body.identitasPihakMenyerahkan,
        identitasPihakMenerima: body.identitasPihakMenerima,
        tanggalMasukLayananTerkonfirmasi: body.tanggalMasukLayananTerkonfirmasi
          ? new Date(body.tanggalMasukLayananTerkonfirmasi)
          : null,
        adaKendala: body.adaKendala,
        kendala: body.kendala,
        perbedaanDariRekomendasi: body.perbedaanDariRekomendasi,
        statusPelaksanaan: body.statusPelaksanaan as StatusPelaksanaanRehab,
        diisiOleh: user.name,
        tanggalDiisi: new Date(),
      },
    });

    sendSuccess(res, pelaksanaan, 'Pelaksanaan rehabilitasi berhasil diperbarui');
  } catch (err) {
    next(err);
  }
};
