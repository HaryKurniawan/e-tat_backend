import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendNotFound } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';

/**
 * Verifikasi publik keabsahan dokumen rekomendasi melalui QR code
 */
export const verifikasiPublikQr = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const qrCode = getParam(req, 'qrCode');

    const rekomendasi = await prisma.rekomendasiResmi.findUnique({
      where: { qrVerificationCode: qrCode },
      include: {
        daftarPengesah: true,
        permohonan: {
          include: {
            terperiksa: {
              select: {
                namaLengkap: true,
                alias: true,
                jenisKelamin: true,
              },
            },
            perkara: {
              select: {
                nomorLaporanPolisi: true,
                instansiPenyidik: true,
              },
            },
          },
        },
      },
    });

    if (!rekomendasi) {
      sendNotFound(res, 'Dokumen rekomendasi tidak valid atau kode QR tidak ditemukan');
      return;
    }

    sendSuccess(
      res,
      {
        valid: true,
        nomorSurat: rekomendasi.nomorSurat,
        tanggalTerbit: rekomendasi.tanggalTerbit,
        isLengkapPengesahan: rekomendasi.isLengkapPengesahan,
        terperiksa: rekomendasi.permohonan.terperiksa,
        perkara: rekomendasi.permohonan.perkara,
        daftarPengesah: rekomendasi.daftarPengesah.map((p) => ({
          nama: p.nama,
          jabatan: p.jabatan,
          instansi: p.instansi,
          status: p.status,
          tanggalPengesahan: p.tanggalPengesahan,
          hash: p.tandaTanganDigitalHash,
        })),
      },
      'Keabsahan dokumen rekomendasi terverifikasi resmi'
    );
  } catch (err) {
    next(err);
  }
};
