import prisma from '../config/database';

/**
 * Generate nomor permohonan format TAT/YYYY/MM/XXXX
 * Contoh: TAT/2026/10/0001
 */
export const generateNomorPermohonan = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // Hitung berapa permohonan di tahun ini
  const count = await prisma.permohonanAsesmen.count({
    where: {
      tanggalPengajuan: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });

  const seq = String(count + 1).padStart(4, '0');
  return `TAT/${year}/${month}/${seq}`;
};

/**
 * Generate tracking number untuk publik (pre-registration)
 * Format: TRK-YYYYMMDD-XXXXX
 */
export const generateTrackingNumber = (): string => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(10000 + Math.random() * 90000);
  return `TRK-${date}-${random}`;
};

/**
 * Generate nomor registrasi akun pengaju
 * Format: REG-TAT/YYYY/INSTANSI-XXX
 */
export const generateNomorRegistrasi = async (instansiKode: string = 'POLRI'): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.registrasiPengguna.count({
    where: {
      tanggalDaftar: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });
  const seq = String(count + 1).padStart(3, '0');
  const kode = instansiKode.slice(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `REG-TAT/${year}/${kode}-${seq}`;
};

/**
 * Generate nomor berita acara sidang pleno
 * Format: BA-PLENO/YYYY/MM/XXXX
 */
export const generateNomorBeritaAcara = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const count = await prisma.sidangPleno.count({
    where: {
      tanggalPleno: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });

  const seq = String(count + 1).padStart(4, '0');
  return `BA-PLENO/${year}/${month}/${seq}`;
};

/**
 * Generate nomor surat rekomendasi resmi
 * Format: REK-TAT/YYYY/MM/XXXX
 */
export const generateNomorRekomendasi = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const count = await prisma.rekomendasiResmi.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });

  const seq = String(count + 1).padStart(4, '0');
  return `REK-TAT/${year}/${month}/${seq}`;
};

/**
 * Generate QR code verification string
 */
export const generateQrCodeString = (prefix: string, nomor: string): string => {
  const random = Math.floor(1000 + Math.random() * 9000);
  const cleanNomor = nomor.replace(/[^a-zA-Z0-9]/g, '');
  return `${prefix}-${cleanNomor}-${random}`;
};
