import { z } from 'zod';

export const pengesahItemSchema = z.object({
  nama: z.string().min(1, 'Nama pengesah wajib diisi'),
  jabatan: z.string().min(1, 'Jabatan pengesah wajib diisi'),
  instansi: z.string().min(1, 'Instansi pengesah wajib diisi'),
});

export const draftRekomendasiSchema = z.object({
  nomorSurat: z.string().optional(),
  ringkasanMedis: z.string().optional(),
  ringkasanHukum: z.string().optional(),
  rekomendasiFinalText: z.string().min(1, 'Rekomendasi final teks wajib diisi'),
  daftarPengesah: z.array(pengesahItemSchema).min(1, 'Minimal satu pengesah dokumen'),
});

export const tandaTanganRekomendasiSchema = z.object({
  pengesahId: z.string().min(1, 'ID pengesah wajib diisi'),
  status: z.enum(['disahkan', 'ditolak_koreksi']),
  catatanKoreksi: z.string().optional(),
  passphrase: z.string().optional(),
});

export const tandaTerimaPengajuSchema = z.object({
  diterimaOleh: z.string().min(1, 'Nama penerima rekomendasi wajib diisi'),
  nomorTandaTerima: z.string().optional(),
});
