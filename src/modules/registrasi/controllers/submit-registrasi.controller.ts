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

    const emailClean = data.email.toLowerCase().trim();

    // Cek email duplikat di registrasi
    const existingReg = await prisma.registrasiPengguna.findFirst({
      where: { email: emailClean },
    });
    if (existingReg) {
      sendError(res, 'Email ini sudah terdaftar dalam antrean verifikasi atau sistem', 409);
      return;
    }

    // Cek email duplikat di tabel user aktif
    const existingUser = await prisma.user.findUnique({
      where: { email: emailClean },
    });
    if (existingUser) {
      sendError(res, 'Email ini sudah terdaftar sebagai akun pengguna aktif di sistem', 409);
      return;
    }

    // Cek NRP duplikat jika diisi
    if (data.nrp) {
      const existingNrp = await prisma.registrasiPengguna.findFirst({
        where: { nrp: data.nrp.trim(), status: { in: ['pending', 'approved'] } },
      });
      if (existingNrp) {
        sendError(res, `NRP/NIP ${data.nrp.trim()} sudah terdaftar dalam sistem`, 409);
        return;
      }
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
