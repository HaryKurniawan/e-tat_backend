import { z } from 'zod';

export const savePrasyaratPemeriksaanSchema = z.object({
  // 1. Checklist Kehadiran & Kedatangan Subjek
  waktuKedatangan: z.string().optional().nullable(),
  kehadiranSubjek: z.boolean().default(false),
  pencocokanIdentitas: z.boolean().default(false),
  catatanPencocokanIdentitas: z.string().optional().nullable(),

  // 2. Petugas Pengantar & Pendamping/Wali Hadir
  namaPengantar: z.string().optional().nullable(),
  instansiPengantar: z.string().optional().nullable(),
  jabatanPengantar: z.string().optional().nullable(),
  kehadiranPengantar: z.boolean().default(false),

  kehadiranPendamping: z.boolean().default(false),
  namaPendamping: z.string().optional().nullable(),
  hubunganPendamping: z.string().optional().nullable(),
  dasarKeterlibatan: z.string().optional().nullable(),
  kontakPendamping: z.string().optional().nullable(),

  // 3. Penerjemah
  membutuhkanPenerjemah: z.boolean().default(false),
  namaPenerjemah: z.string().optional().nullable(),
  bahasaPenerjemah: z.string().optional().nullable(),
  kehadiranPenerjemah: z.boolean().default(false),
  nomorPenugasanPenerjemah: z.string().optional().nullable(),

  // 4. Form Persetujuan / Assent (Informed Consent)
  sudahDisetujui: z.boolean().default(false),
  jenisFormPersetujuan: z.string().optional().nullable(),
  tanggalPersetujuan: z.string().optional().nullable(),
  penandatanganPersetujuan: z.string().optional().nullable(),
  dokumenPersetujuanUrl: z.string().optional().nullable(),

  // 5. Pernyataan Bebas Biaya
  pernyataanBebasBiaya: z.boolean().default(false),
  tanggalPernyataanBebasBiaya: z.string().optional().nullable(),
  dokumenBebasBiayaUrl: z.string().optional().nullable(),

  // Catatan Tambahan / Kondisi Khusus
  kondisiKhususDarurat: z.boolean().default(false),
  catatanKondisiKhusus: z.string().optional().nullable(),
  tindakanDaruratRujukan: z.string().optional().nullable(),
});

export type SavePrasyaratPemeriksaanInput = z.infer<typeof savePrasyaratPemeriksaanSchema>;
