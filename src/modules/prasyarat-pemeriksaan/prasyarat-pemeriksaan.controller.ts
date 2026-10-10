import { Request, Response } from 'express';
import prisma from '../../config/database';
import { sendSuccess, sendError, sendNotFound } from '../../utils/response.util';
import { logAudit } from '../../utils/audit.util';
import { savePrasyaratPemeriksaanSchema } from './prasyarat-pemeriksaan.schema';
import { ApplicationStatus } from '@prisma/client';

/**
 * Mendapatkan data Prasyarat Pemeriksaan berdasarkan permohonanId
 */
export const getPrasyaratPemeriksaan = async (req: Request, res: Response): Promise<Response> => {
  try {
    const permohonanId = req.params.permohonanId as string;

    const permohonan = await prisma.permohonanAsesmen.findUnique({
      where: { id: permohonanId },
      select: { id: true, nomorPermohonan: true, applicationStatus: true },
    });

    if (!permohonan) {
      return sendNotFound(res, 'Permohonan tidak ditemukan');
    }

    const prasyarat = await prisma.prasyaratPemeriksaan.findUnique({
      where: { permohonanId },
      include: {
        petugasPenerima: {
          select: { id: true, name: true, role: true, nip: true, agency: true },
        },
      },
    });

    return sendSuccess(res, {
      permohonan,
      prasyarat: prasyarat || null,
    }, 'Data prasyarat pemeriksaan berhasil diambil');
  } catch (error: any) {
    console.error('Error getPrasyaratPemeriksaan:', error);
    return sendError(res, 'Gagal mengambil data prasyarat pemeriksaan', 500, error.message);
  }
};

/**
 * Menyimpan / memperbarui data Prasyarat Pemeriksaan
 */
export const savePrasyaratPemeriksaan = async (req: Request, res: Response): Promise<Response> => {
  try {
    const permohonanId = req.params.permohonanId as string;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userName = req.user?.name || 'User System';

    if (!userId) {
      return sendError(res, 'User tidak terautentikasi', 401);
    }

    const permohonan = await prisma.permohonanAsesmen.findUnique({
      where: { id: permohonanId },
    });

    if (!permohonan) {
      return sendNotFound(res, 'Permohonan tidak ditemukan');
    }

    const validationResult = savePrasyaratPemeriksaanSchema.safeParse(req.body);
    if (!validationResult.success) {
      return sendError(
        res,
        'Validasi data prasyarat gagal',
        400,
        JSON.stringify(validationResult.error.flatten().fieldErrors)
      );
    }

    const input = validationResult.data;

    const savedPrasyarat = await prisma.prasyaratPemeriksaan.upsert({
      where: { permohonanId },
      create: {
        permohonanId,
        petugasPenerimaId: userId,
        waktuKedatangan: input.waktuKedatangan ? new Date(input.waktuKedatangan) : new Date(),
        kehadiranSubjek: input.kehadiranSubjek,
        pencocokanIdentitas: input.pencocokanIdentitas,
        catatanPencocokanIdentitas: input.catatanPencocokanIdentitas,

        namaPengantar: input.namaPengantar,
        instansiPengantar: input.instansiPengantar,
        jabatanPengantar: input.jabatanPengantar,
        kehadiranPengantar: input.kehadiranPengantar,

        kehadiranPendamping: input.kehadiranPendamping,
        namaPendamping: input.namaPendamping,
        hubunganPendamping: input.hubunganPendamping,
        dasarKeterlibatan: input.dasarKeterlibatan,
        kontakPendamping: input.kontakPendamping,

        membutuhkanPenerjemah: input.membutuhkanPenerjemah,
        namaPenerjemah: input.namaPenerjemah,
        bahasaPenerjemah: input.bahasaPenerjemah,
        kehadiranPenerjemah: input.kehadiranPenerjemah,
        nomorPenugasanPenerjemah: input.nomorPenugasanPenerjemah,

        sudahDisetujui: input.sudahDisetujui,
        jenisFormPersetujuan: input.jenisFormPersetujuan,
        tanggalPersetujuan: input.tanggalPersetujuan ? new Date(input.tanggalPersetujuan) : null,
        penandatanganPersetujuan: input.penandatanganPersetujuan,
        dokumenPersetujuanUrl: input.dokumenPersetujuanUrl,

        pernyataanBebasBiaya: input.pernyataanBebasBiaya,
        tanggalPernyataanBebasBiaya: input.tanggalPernyataanBebasBiaya ? new Date(input.tanggalPernyataanBebasBiaya) : null,
        dokumenBebasBiayaUrl: input.dokumenBebasBiayaUrl,

        kondisiKhususDarurat: input.kondisiKhususDarurat,
        catatanKondisiKhusus: input.catatanKondisiKhusus,
        tindakanDaruratRujukan: input.tindakanDaruratRujukan,
      },
      update: {
        petugasPenerimaId: userId,
        waktuKedatangan: input.waktuKedatangan ? new Date(input.waktuKedatangan) : undefined,
        kehadiranSubjek: input.kehadiranSubjek,
        pencocokanIdentitas: input.pencocokanIdentitas,
        catatanPencocokanIdentitas: input.catatanPencocokanIdentitas,

        namaPengantar: input.namaPengantar,
        instansiPengantar: input.instansiPengantar,
        jabatanPengantar: input.jabatanPengantar,
        kehadiranPengantar: input.kehadiranPengantar,

        kehadiranPendamping: input.kehadiranPendamping,
        namaPendamping: input.namaPendamping,
        hubunganPendamping: input.hubunganPendamping,
        dasarKeterlibatan: input.dasarKeterlibatan,
        kontakPendamping: input.kontakPendamping,

        membutuhkanPenerjemah: input.membutuhkanPenerjemah,
        namaPenerjemah: input.namaPenerjemah,
        bahasaPenerjemah: input.bahasaPenerjemah,
        kehadiranPenerjemah: input.kehadiranPenerjemah,
        nomorPenugasanPenerjemah: input.nomorPenugasanPenerjemah,

        sudahDisetujui: input.sudahDisetujui,
        jenisFormPersetujuan: input.jenisFormPersetujuan,
        tanggalPersetujuan: input.tanggalPersetujuan ? new Date(input.tanggalPersetujuan) : null,
        penandatanganPersetujuan: input.penandatanganPersetujuan,
        dokumenPersetujuanUrl: input.dokumenPersetujuanUrl,

        pernyataanBebasBiaya: input.pernyataanBebasBiaya,
        tanggalPernyataanBebasBiaya: input.tanggalPernyataanBebasBiaya ? new Date(input.tanggalPernyataanBebasBiaya) : null,
        dokumenBebasBiayaUrl: input.dokumenBebasBiayaUrl,

        kondisiKhususDarurat: input.kondisiKhususDarurat,
        catatanKondisiKhusus: input.catatanKondisiKhusus,
        tindakanDaruratRujukan: input.tindakanDaruratRujukan,
      },
      include: {
        petugasPenerima: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    // Jika status permohonan masih SCHEDULED dan prasyarat/kehadiran telah diverifikasi, bisa transisi ke ASSESSMENT_ACTIVE
    if (permohonan.applicationStatus === ApplicationStatus.SCHEDULED && input.kehadiranSubjek && input.sudahDisetujui) {
      await prisma.permohonanAsesmen.update({
        where: { id: permohonanId },
        data: { applicationStatus: ApplicationStatus.ASSESSMENT_ACTIVE },
      });
    }

    await logAudit({
      actorId: userId,
      actorNama: userName,
      actorPeran: userRole || 'UNKNOWN',
      permohonanId,
      aksi: 'UPDATE_PRASYARAT_PEMERIKSAAN',
      rincian: `Menyimpan data prasyarat pemeriksaan dan penerimaan subjek (${permohonan.nomorPermohonan || permohonanId})`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendSuccess(res, savedPrasyarat, 'Prasyarat pemeriksaan berhasil disimpan');
  } catch (error: any) {
    console.error('Error savePrasyaratPemeriksaan:', error);
    return sendError(res, 'Gagal menyimpan prasyarat pemeriksaan', 500, error.message);
  }
};
