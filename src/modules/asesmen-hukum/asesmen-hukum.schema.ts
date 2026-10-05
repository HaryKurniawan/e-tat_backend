import { z } from 'zod';

export const saveAsesmenHukumSchema = z.object({
  pernahDitangkap: z.boolean().default(false),
  keteranganPerkaraLalu: z.string().optional(),
  terverifikasiDatabase: z.boolean().default(false),

  analisisPeran: z.enum([
    'Korban',
    'Pecandu_Penyalahguna',
    'Pengedar',
    'Bandar',
    'Kurir',
    'Produsen',
    'Belum_Dapat_Disimpulkan',
  ]).default('Belum_Dapat_Disimpulkan'),
  argumentasiPeran: z.string().optional(),
  faktaPendukung: z.array(z.string()).default([]),
  catatanBelumTerverifikasi: z.string().optional(),
  analisisBarangBukti: z.string().optional(),

  kesimpulanHukum: z.string().optional(),
  rekomendasiHukum: z.enum([
    'Lanjut_Peradilan_Rehab',
    'Diversi_Restorative_Justice',
    'Proses_Hukum_Murni',
    'Penghentian_Penyidikan',
    'Lainnya',
  ]).optional(),
  catatanKlarifikasi: z.string().optional(),
});
