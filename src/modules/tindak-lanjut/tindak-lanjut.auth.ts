import { UserRole } from '@prisma/client';
import prisma from '../../config/database';

/**
 * Validasi otorisasi tindak lanjut & laporan kontrol:
 * - ADMIN: Selalu diizinkan.
 * - PENGAJU: Hanya untuk berkas yang diajukan oleh akun pengaju bersangkutan.
 * - MEDIS: Hanya untuk tersangka yang ditugaskan dan diperiksa oleh tenaga medis bersangkutan.
 */
export const checkTindakLanjutAuthorization = async (
  permohonanId: string,
  user: { id: string; role: string; name: string }
): Promise<{ authorized: boolean; notFound?: boolean; message?: string }> => {
  if (user.role === UserRole.ADMIN) {
    return { authorized: true };
  }

  const permohonan = await prisma.permohonanAsesmen.findUnique({
    where: { id: permohonanId },
    include: {
      timAsesmen: true,
      asesmenMedis: true,
    },
  });

  if (!permohonan) {
    return { authorized: false, notFound: true, message: 'Permohonan tidak ditemukan' };
  }

  if (user.role === UserRole.PENGAJU) {
    if (permohonan.pengajuId !== user.id) {
      return {
        authorized: false,
        message: 'Akses ditolak: Anda tidak memiliki akses ke berkas permohonan ini.',
      };
    }
    return { authorized: true };
  }

  if (user.role === UserRole.MEDIS) {
    const userName = (user.name || '').toLowerCase().trim();
    const isAssigned =
      permohonan.timAsesmen?.asesorMedisId === user.id ||
      (permohonan.timAsesmen?.asesorMedisNama &&
        permohonan.timAsesmen.asesorMedisNama.toLowerCase().includes(userName)) ||
      permohonan.asesmenMedis?.asesorId === user.id ||
      (permohonan.asesmenMedis?.asesorNama &&
        permohonan.asesmenMedis.asesorNama.toLowerCase().includes(userName));

    if (!isAssigned) {
      return {
        authorized: false,
        message:
          'Akses ditolak: Tenaga medis hanya dapat melakukan penjadwalan dan penginputan kontrol untuk tersangka yang ditugaskan kepada Anda.',
      };
    }
    return { authorized: true };
  }

  return { authorized: false, message: 'Akses ditolak untuk role Anda.' };
};
