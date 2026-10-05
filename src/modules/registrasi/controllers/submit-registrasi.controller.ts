import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendCreated, sendError } from '../../../utils/response.util';
import { generateNomorRegistrasi } from '../../../utils/nomor.util';
import { registrasiSchema } from '../registrasi.schema';
import { logAudit } from '../../../utils/audit.util';

/**
 * POST /api/registrasi
 * Publik: Submit pendaftaran akun baru (Pengaju)
 */
export const submitRegistrasi = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = registrasiSchema.parse(req.body);

    // Cek email duplikat
    const existing = await prisma.registrasiPengguna.findFirst({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      sendError(res, 'Email ini sudah terdaftar', 409);
      return;
    }

    const nomorRegistrasi = await generateNomorRegistrasi(data.instansi);

    const registrasi = await prisma.registrasiPengguna.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
        nomorRegistrasi,
        kategoriInstansi: data.kategoriInstansi,
        status: 'pending',
      },
    });

    // Audit log
    await logAudit({
      actorNama: data.namaLengkap,
      actorPeran: 'PENGAJU',
      aksi: 'SUBMIT_REGISTRASI',
      rincian: `Pendaftaran baru: ${data.namaLengkap} dari ${data.instansi}`,
      ipAddress: req.ip,
    });

    sendCreated(res, registrasi, 'Pendaftaran berhasil dikirim. Menunggu verifikasi admin.');
  } catch (err) {
    next(err);
  }
};
