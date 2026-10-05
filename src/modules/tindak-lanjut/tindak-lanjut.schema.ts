import { z } from 'zod';

export const updateTindakLanjutSchema = z.object({
  jenisTindakLanjut: z.enum([
    'Rujukan_Rehabilitasi',
    'Proses_Peradilan',
    'Diversi_Restorative_Justice',
    'Lainnya',
  ]),
  namaFasilitasTujuan: z.string().optional(),
  kontakFasilitas: z.string().optional(),
  statusRujukan: z.enum([
    'belum_kirim',
    'terkirim',
    'diterima_fasilitas',
    'kapasitas_penuh',
    'klien_mulai_layanan',
    'batal_kendala',
    'sedang_dikoordinasikan',
  ]).default('belum_kirim'),
  tanggalRujukanDikirim: z.string().datetime().optional().nullable(),
  tanggalKonfirmasiFasilitas: z.string().datetime().optional().nullable(),
  tanggalMulaiLayanan: z.string().datetime().optional().nullable(),
  hambatanPelaksanaan: z.string().optional(),
  penanggungJawabTindakLanjut: z.string().optional(),
  statusProsesHukumTerkait: z.string().optional(),
});

export const updatePelaksanaanRehabSchema = z.object({
  namaFasilitasTujuan: z.string().optional(),
  alamatFasilitas: z.string().optional(),
  kontakPenanggungJawabFasilitas: z.string().optional(),
  namaPenanggungJawabFasilitas: z.string().optional(),
  tanggalKoordinasiPenerimaan: z.string().datetime().optional().nullable(),
  hasilKoordinasiPenerimaan: z.string().optional(),
  catatanKoordinasi: z.string().optional(),
  tanggalSerahTerimaAktual: z.string().datetime().optional().nullable(),
  identitasPihakMenyerahkan: z.string().optional(),
  identitasPihakMenerima: z.string().optional(),
  tanggalMasukLayananTerkonfirmasi: z.string().datetime().optional().nullable(),
  adaKendala: z.boolean().default(false),
  kendala: z.string().optional(),
  perbedaanDariRekomendasi: z.string().optional(),
  statusPelaksanaan: z.enum([
    'perlu_konfirmasi',
    'koordinasi_berjalan',
    'serah_terima_selesai',
    'klien_mulai_layanan',
    'terkendala_eskalasi',
  ]).default('perlu_konfirmasi'),
});

export const createLaporanKontrolSchema = z.object({
  jenisLaporan: z.enum([
    'Laporan_Kemajuan_Periodik',
    'Laporan_Kunjungan_Kontrol',
    'Laporan_Evaluasi_Klinis',
    'Laporan_Wajib_Lapor',
    'Laporan_Kejadian_Khusus',
    'Laporan_Akhir_Layanan',
  ]),
  tanggalKegiatanSebenarnya: z.string().datetime().or(z.string().min(1)),
  namaFasilitasPelapor: z.string().optional(),
  nomorLaporanFasilitas: z.string().optional(),
  tanggalLaporanFasilitas: z.string().datetime().optional().nullable(),
  namaPenerbitLaporan: z.string().optional(),
  kapasitasPenerbit: z.string().optional(),
  statusPelaksanaanBerdasarkanBukti: z.enum([
    'terlaksana',
    'tidak_terlaksana',
    'terlaksana_sebagian',
    'tidak_terkonfirmasi',
  ]).default('tidak_terkonfirmasi'),
  ringkasanAdministratif: z.string().optional(),
  catatanKendala: z.string().optional(),
  rencanaBerdasarkanLaporan: z.string().optional(),
});
