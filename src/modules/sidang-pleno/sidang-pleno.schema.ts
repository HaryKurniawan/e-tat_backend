import { z } from 'zod';

export const daftarHadirItemSchema = z.object({
  nama: z.string().min(1, 'Nama peserta hadir wajib diisi'),
  peran: z.string().min(1, 'Peran/jabatan dalam pleno wajib diisi'),
  instansi: z.string().min(1, 'Instansi peserta wajib diisi'),
  hadir: z.boolean().default(false),
});

export const jadwalPlenoSchema = z.object({
  tanggalPleno: z.string().datetime().or(z.string().min(1)),
  waktu: z.string().optional(),
  tempat: z.string().optional(),
  pimpinanPleno: z.string().optional(),
});

export const hasilPlenoSchema = z.object({
  nomorBeritaAcara: z.string().optional(),
  pokokBahasan: z.string().optional(),
  catatanPerbedaanPendapat: z.string().optional(),
  kesepakatanRekomendasi: z.string().optional(),
  jenisRekomendasiFinal: z.enum([
    'Rehabilitasi_Rawat_Inap',
    'Rehabilitasi_Rawat_Jalan',
    'Lanjut_Proses_Hukum_Tanpa_Rehab',
    'Pemeriksaan_Tambahan',
  ]),
  durasiRehabBulan: z.number().int().optional(),
  fasilitasRujukanUsulan: z.string().optional(),
  statusPleno: z
    .enum(['terjadwal', 'berlangsung', 'selesai_sepakat', 'butuh_klarifikasi_tambahan'])
    .default('selesai_sepakat'),
  daftarHadir: z.array(daftarHadirItemSchema).optional(),
  fotoKehadiranUrl: z.string().optional(),
  fotoKehadiranKeterangan: z.string().optional(),
  fotoKehadiranList: z
    .array(
      z.object({
        url: z.string(),
        keterangan: z.string().optional(),
      })
    )
    .optional(),
});
