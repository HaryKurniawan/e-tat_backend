import { z } from 'zod';

export const saveAsesmenHukumSchema = z.object({
  pernahDitangkap: z.boolean().default(false),
  keteranganPerkaraLalu: z.string().optional(),
  terverifikasiDatabase: z.boolean().default(false),

  analisisPeran: z.string().optional().default('Belum_Dapat_Disimpulkan'),
  argumentasiPeran: z.string().optional(),
  faktaPendukung: z.array(z.string()).default([]),
  catatanBelumTerverifikasi: z.string().optional(),
  analisisBarangBukti: z.string().optional(),

  kesimpulanHukum: z.string().optional(),
  rekomendasiHukum: z.string().optional(),
  catatanKlarifikasi: z.string().optional(),
});
