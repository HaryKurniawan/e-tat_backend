import { z } from 'zod';

export const riwayatZatSchema = z.object({
  jenisZat: z.string().min(1, 'Jenis zat wajib diisi'),
  caraPakai: z.string().min(1, 'Cara pakai wajib diisi'),
  frekuensi: z.string().min(1, 'Frekuensi wajib diisi'),
  lamaPemakaianBulan: z.number().int().nonnegative(),
  terakhirPakai: z.string().optional(),
});

export const hasilUrinSchema = z.object({
  parameter: z.string().min(1, 'Parameter wajib diisi (AMP, MET, THC, BZO, MOP)'),
  hasil: z.string().min(1, 'Hasil wajib diisi (Positif / Negatif)'),
});

export const saveAsesmenMedisSchema = z.object({
  kondisiFisik: z.string().max(500).optional(),
  tekananDarah: z.string().max(20).optional(),
  denyutNadi: z.string().max(20).optional(),
  pernapasan: z.string().max(20).optional(),
  suhuTubuh: z.string().max(20).optional(),
  needleTracks: z.string().max(50).optional(),
  kondisiIntoksikasi: z.string().max(50).optional(),
  fasilitasRujukan: z.string().max(200).optional(),
  tandaBekasSuntikan: z.boolean().default(false),
  komorbiditasMedis: z.string().max(500).optional(),
  kondisiPsikologis: z.string().max(2000).optional(),
  
  riwayatZat: z.array(riwayatZatSchema).optional(),
  hasilUrin: z.array(hasilUrinSchema).optional(),

  instrumen: z.string().default('ASSIST'),
  skorInstrumen: z.number().nonnegative().optional(),
  tingkatRisikoInstrumen: z.string().max(100).optional(),

  diagnosisKlinisIcd: z.string().max(200).optional(),
  interpretasiKlinis: z.string().max(2000).optional(),
  kebutuhanRawat: z.string().max(100).optional(),
  durasiUsulanBulan: z.number().int().positive().nullable().optional(),
  catatanKhusus: z.string().max(1000).optional(),
  permintaanPemeriksaanTambahan: z.string().max(1000).optional(),
});

export const asamDimensiSchema = z.object({
  dimensi: z.enum([
    'intoksikasi',
    'komplikasi_medis',
    'kondisi_psikologis',
    'kesiapan_berubah',
    'potensi_kekambuhan',
    'lingkungan_pemulihan',
  ]),
  levelDipilih: z.number().int().min(0).max(4),
  catatanKlinis: z.string().optional(),
  indikatorTerpilih: z.array(z.string()).default([]),
});

export const saveKriteriaPlasemenSchema = z.object({
  wawancaraTambahanDilakukan: z.boolean().default(false),
  catatanWawancara: z.string().optional(),
  penilaianPerDimensi: z.array(asamDimensiSchema).min(6, 'Harus mencakup seluruh 6 dimensi ASAM'),
  levelRekomendasiAkhir: z.number().int().min(0).max(4),
  justifikasiRekomendasi: z.string().optional(),
  adaDisparitasDimensi: z.boolean().default(false),
  catatanDisparitas: z.string().optional(),
});
