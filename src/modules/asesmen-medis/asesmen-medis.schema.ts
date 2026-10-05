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
  kondisiFisik: z.string().optional(),
  tekananDarah: z.string().optional(),
  denyutNadi: z.string().optional(),
  tandaBekasSuntikan: z.boolean().default(false),
  komorbiditasMedis: z.string().optional(),
  kondisiPsikologis: z.string().optional(),
  
  riwayatZat: z.array(riwayatZatSchema).optional(),
  hasilUrin: z.array(hasilUrinSchema).optional(),

  instrumen: z.string().default('ASSIST'),
  skorInstrumen: z.number().optional(),
  tingkatRisikoInstrumen: z.string().optional(),

  diagnosisKlinisIcd: z.string().optional(),
  interpretasiKlinis: z.string().optional(),
  kebutuhanRawat: z.string().optional(),
  durasiUsulanBulan: z.number().int().optional(),
  catatanKhusus: z.string().optional(),
  permintaanPemeriksaanTambahan: z.string().optional(),
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
