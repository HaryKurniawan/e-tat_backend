import { Request, Response, NextFunction } from 'express';
import {
  JenisLaporanKontrol,
  StatusPelaksanaanBukti,
} from '@prisma/client';
import prisma from '../../../config/database';
import { sendCreated, sendForbidden, sendNotFound } from '../../../utils/response.util';
import { createLaporanKontrolSchema } from '../tindak-lanjut.schema';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';
import { checkTindakLanjutAuthorization } from '../tindak-lanjut.auth';

/**
 * Menambahkan Laporan Kontrol / Perkembangan Layanan
 */
export const addLaporanKontrol = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const user = req.user!;

    // Validasi otorisasi (khususnya pembatasan akses tenaga medis & pengaju)
    const authCheck = await checkTindakLanjutAuthorization(permohonanId, user);
    if (!authCheck.authorized) {
      if (authCheck.notFound) {
        sendNotFound(res, authCheck.message);
      } else {
        sendForbidden(res, authCheck.message);
      }
      return;
    }

    const body = createLaporanKontrolSchema.parse(req.body);

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

    const fileBuktiUrl = req.file ? `/uploads/bukti/${req.file.filename}` : undefined;

    const laporan = await prisma.laporanKontrol.create({
      data: {
        monitoringId: monitoring.id,
        jenisLaporan: body.jenisLaporan as JenisLaporanKontrol,
        tanggalKegiatanSebenarnya: new Date(body.tanggalKegiatanSebenarnya),
        namaFasilitasPelapor: body.namaFasilitasPelapor,
        nomorLaporanFasilitas: body.nomorLaporanFasilitas,
        tanggalLaporanFasilitas: body.tanggalLaporanFasilitas
          ? new Date(body.tanggalLaporanFasilitas)
          : null,
        namaPenerbitLaporan: body.namaPenerbitLaporan,
        kapasitasPenerbit: body.kapasitasPenerbit,
        statusPelaksanaanBerdasarkanBukti:
          body.statusPelaksanaanBerdasarkanBukti as StatusPelaksanaanBukti,
        ringkasanAdministratif: body.ringkasanAdministratif,
        catatanKendala: body.catatanKendala,
        rencanaBerdasarkanLaporan: body.rencanaBerdasarkanLaporan,
        fileBuktiUrl,
        diunggahOleh: user.name,
        kapasitasPengunggah: user.role,
      },
    });

    await logAudit({
      permohonanId,
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      aksi: 'TAMBAH_LAPORAN_KONTROL',
      rincian: `Laporan kontrol jenis ${body.jenisLaporan} diunggah oleh ${user.name}`,
    });

    sendCreated(res, laporan, 'Laporan kontrol berhasil ditambahkan');
  } catch (err) {
    next(err);
  }
};
