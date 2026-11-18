import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendError, sendNotFound } from '../../../utils/response.util';
import { hashPassword } from '../../../utils/hash.util';
import { approveRegistrasiSchema } from '../registrasi.schema';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';
import { sendEmailPemberitahuanPersetujuanAkun } from '../../../services/email.service';

/**
 * PATCH /api/registrasi/:id/approve
 * Admin: Setujui pendaftaran dan buat akun user
 */
export const approveRegistrasi = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req, 'id');
    const { catatanAdmin } = approveRegistrasiSchema.parse(req.body);

    const registrasi = await prisma.registrasiPengguna.findUnique({ where: { id } });
    if (!registrasi) {
      sendNotFound(res, 'Data registrasi tidak ditemukan');
      return;
    }

    if (registrasi.status !== 'pending') {
      sendError(res, `Registrasi sudah berstatus: ${registrasi.status}`, 400);
      return;
    }

    // Cek apakah email sudah ada sebagai user aktif
    const existingUser = await prisma.user.findUnique({
      where: { email: registrasi.email.toLowerCase() },
    });

    // Buat password sementara dari NRP
    const tempPassword = await hashPassword(registrasi.nrp);

    // Jalankan dalam transaksi
    const [updatedReg, newUser] = await prisma.$transaction(async (tx) => {
      const updated = await tx.registrasiPengguna.update({
        where: { id },
        data: {
          status: 'approved',
          catatanAdmin,
          approvedAt: new Date(),
          approvedById: req.user!.id,
        },
      });

      let user = existingUser;
      if (!user) {
        // Tentukan role otomatis berdasarkan jabatan / instansi pendaftar
        let resolvedRole: 'PENGAJU' | 'MEDIS' | 'HUKUM' = 'PENGAJU';
        const jLower = (registrasi.jabatan || '').toLowerCase();
        const iLower = (registrasi.instansi || '').toLowerCase();
        if (
          jLower.includes('dokter') ||
          jLower.includes('medis') ||
          jLower.includes('psikolog') ||
          iLower.includes('rs') ||
          iLower.includes('kesehatan') ||
          iLower.includes('klinik')
        ) {
          resolvedRole = 'MEDIS';
        } else if (
          jLower.includes('jaksa') ||
          jLower.includes('hukum') ||
          registrasi.kategoriInstansi === 'Kejaksaan'
        ) {
          resolvedRole = 'HUKUM';
        }

        user = await tx.user.create({
          data: {
            email: registrasi.email.toLowerCase(),
            password: tempPassword,
            role: resolvedRole,
            name: `${registrasi.pangkat ? registrasi.pangkat + ' ' : ''}${registrasi.namaLengkap}`,
            nip: registrasi.nrp,
            agency: registrasi.instansi,
            phone: registrasi.phone,
            isActive: true,
          },
        });
      }

      return [updated, user];
    });

    await logAudit({
      actorId: req.user!.id,
      actorNama: req.user!.name,
      actorPeran: req.user!.role,
      aksi: 'APPROVE_REGISTRASI',
      rincian: `Menyetujui registrasi: ${registrasi.namaLengkap} → User ID: ${newUser.id}`,
    });

    // Kirim Surat Pemberitahuan Persetujuan Akun Elektronik ke Email Pendaftar
    sendEmailPemberitahuanPersetujuanAkun({
      emailTujuan: registrasi.email.toLowerCase(),
      namaLengkap: registrasi.namaLengkap,
      pangkat: registrasi.pangkat,
      nrp: registrasi.nrp,
      jabatan: registrasi.jabatan,
      instansi: registrasi.instansi,
      kategoriInstansi: registrasi.kategoriInstansi,
      wilayahHukum: registrasi.wilayahHukum,
      alamatKantor: registrasi.alamatKantor,
      nomorRegistrasi: registrasi.nomorRegistrasi,
      tanggalDaftar: registrasi.tanggalDaftar,
      phone: registrasi.phone,
      teleponKantor: registrasi.teleponKantor,
      catatanAdmin,
      approvedAt: updatedReg.approvedAt,
      approvedByNama: req.user!.name,
      role: newUser.role,
      passwordAwal: registrasi.nrp,
    }).catch((emailErr) => {
      console.warn('⚠️ Gagal mengirim email persetujuan akun:', emailErr?.message || emailErr);
    });

    sendSuccess(
      res,
      { registrasi: updatedReg, user: { id: newUser.id, email: newUser.email } },
      'Registrasi disetujui dan akun berhasil dibuat'
    );
  } catch (err) {
    next(err);
  }
};
