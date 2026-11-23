import { UserRole } from '@prisma/client';

// Include lengkap untuk detail permohonan
export const permohonanFullInclude = {
  pengaju: { select: { id: true, name: true, email: true, agency: true, role: true } },
  terperiksa: true,
  perkara: { include: { barangBuktiList: true } },
  dokumenList: true,
  timAsesmen: {
    include: {
      asesorMedis: { select: { id: true, name: true, email: true } },
      asesorHukum: { select: { id: true, name: true, email: true } },
      sekretariat: { select: { id: true, name: true } },
    },
  },
  asesmenMedis: { include: { riwayatZat: true, hasilUrin: true } },
  asesmenHukum: true,
  sidangPleno: { include: { daftarHadir: true } },
  rekomendasiResmi: { include: { daftarPengesah: true } },
  tindakLanjutLayanan: true,
  monitoringTindakLanjut: {
    include: {
      pelaksanaanRehab: true,
      laporanKontrolList: true,
      buktiWajibLaporList: true,
      akhirLayanan: true,
    },
  },
  klarifikasiList: true,
  instrumenKriteriaPlasemen: { include: { penilaianPerDimensi: true } },
};

/**
 * Mendapatkan filter where berdasarkan role user
 */
export const getRoleBasedWhere = (userId: string, role: UserRole, extraWhere?: any) => {
  const base = extraWhere || {};
  if (role === 'PENGAJU') {
    return { ...base, pengajuId: userId };
  }
  if (role === 'MEDIS') {
    return { ...base, timAsesmen: { asesorMedisId: userId } };
  }
  if (role === 'HUKUM') {
    return { ...base, timAsesmen: { asesorHukumId: userId } };
  }
  // ADMIN: akses semua
  return base;
};
