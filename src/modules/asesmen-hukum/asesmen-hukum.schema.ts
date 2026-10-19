import { z } from 'zod';

export const saveAsesmenHukumSchema = z.object({
  pernahDitangkap: z.boolean().default(false),
  keteranganPerkaraLalu: z.string().max(1000).optional(),
  terverifikasiDatabase: z.boolean().default(false),

  analisisPeran: z.string().max(100).optional().default('Belum_Dapat_Disimpulkan'),
  argumentasiPeran: z.string().max(3000).optional(),
  faktaPendukung: z.array(z.string().max(500)).default([]),
  catatanBelumTerverifikasi: z.string().max(1000).optional(),
  analisisBarangBukti: z.string().max(3000).optional(),

  kesimpulanHukum: z.string().max(3000).optional(),
  rekomendasiHukum: z.string().max(100).optional(),
  catatanKlarifikasi: z.string().max(2000).optional(),
  catatanKhusus: z.string().max(2000).optional(),

  // Data verifikasi perkara oleh penelaah hukum
  nomorLp: z.string().max(150).optional(),
  pasalSangkaan: z.string().max(500).optional(),
  lokasiTkp: z.string().max(500).optional(),
  kronologiPenangkapan: z.string().max(5000).optional(),
  totalBeratBersihGram: z.union([z.number(), z.string()]).optional(),
  kesesuaianSema: z.string().max(250).optional(),
  ambangBatasSema: z.string().max(250).optional(),
  keterkaitanSindikat: z.string().max(500).optional(),
  sumberPerolehan: z.string().max(2000).optional(),
});

