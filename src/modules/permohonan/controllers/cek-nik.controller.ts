import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess } from '../../../utils/response.util';

/**
 * GET /api/permohonan/cek-nik/:nik
 * Pengecekan rekam jejak terpadu terperiksa berdasarkan NIK secara nasional di database.
 */
export const cekNikPermohonan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nik } = req.params;

    if (!nik || typeof nik !== 'string' || nik.trim().length === 0) {
      sendSuccess(res, {
        nik: '',
        adaRiwayat: false,
        totalKasus: 0,
        riwayat: [],
      }, 'NIK tidak valid');
      return;
    }

    const cleanNik = nik.trim();

    // Query seluruh permohonan asesmen yang pernah terdaftar dengan NIK ini
    const permohonanList = await prisma.permohonanAsesmen.findMany({
      where: {
        terperiksa: {
          nik: {
            equals: cleanNik,
          },
        },
      },
      orderBy: {
        tanggalPengajuan: 'desc',
      },
      include: {
        terperiksa: true,
        perkara: {
          include: {
            barangBuktiList: true,
          },
        },
        rekomendasiResmi: true,
        tindakLanjutLayanan: true,
      },
    });

    const formattedRiwayat = permohonanList.map((p) => {
      const bbSummary = p.perkara?.barangBuktiList?.length
        ? p.perkara.barangBuktiList.map((bb) => `${bb.jenisZat} (${bb.beratBersihGram} gr)`).join(', ')
        : 'Tidak ada barang bukti';

      return {
        id: p.id,
        nomorPermohonan: p.nomorPermohonan,
        nomorLp: p.perkara?.nomorLaporanPolisi || '-',
        tanggalLp: p.perkara?.tanggalLp ? p.perkara.tanggalLp.toISOString().split('T')[0] : '-',
        tanggalPengajuan: p.tanggalPengajuan ? p.tanggalPengajuan.toISOString().split('T')[0] : '-',
        instansiPengaju: p.instansiPengaju || p.perkara?.instansiPenyidik || '-',
        pasal: p.perkara?.pasalDipersangkakan || '-',
        status: p.applicationStatus,
        kronologi: p.perkara?.kronologiSingkat || '-',
        barangBuktiSummary: bbSummary,
        rekomendasiFinal: p.rekomendasiResmi?.rekomendasiFinalText || null,
        rekomendasiNomor: p.rekomendasiResmi?.nomorSurat || null,
        fasilitasRehab: p.tindakLanjutLayanan?.namaFasilitasTujuan || null,
      };
    });

    sendSuccess(
      res,
      {
        nik: cleanNik,
        adaRiwayat: formattedRiwayat.length > 0,
        totalKasus: formattedRiwayat.length,
        statusResidivis:
          formattedRiwayat.length === 0
            ? 'bukan_residivis'
            : formattedRiwayat.length === 1
            ? 'residivis_1x'
            : 'residivis_berulang',
        riwayat: formattedRiwayat,
      },
      formattedRiwayat.length > 0
        ? `Ditemukan ${formattedRiwayat.length} riwayat perkara/asesmen untuk NIK ${cleanNik}`
        : `Tidak ditemukan riwayat kasus sebelumnya (Nihil) untuk NIK ${cleanNik}`
    );
  } catch (err) {
    next(err);
  }
};
