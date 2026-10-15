import { z } from 'zod';

// =====================================================================
// SCHEMAS UNTUK PERMOHONAN
// =====================================================================

export const terperiksaSchema = z.object({
  namaLengkap: z.string().min(2, 'Nama minimal 2 karakter'),
  alias: z.string().optional(),
  nik: z.string().optional(),
  isNikVerified: z.boolean().default(false),
  statusIdentitasKhusus: z.string().optional(),
  tempatLahir: z.string().min(1, 'Tempat lahir wajib diisi'),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  usia: z.number().int().min(0).max(120),
  jenisKelamin: z.enum(['Laki-laki', 'Perempuan']),
  pekerjaan: z.string().optional(),
  alamatKtp: z.string().min(1, 'Alamat KTP wajib diisi'),
  alamatDomisili: z.string().optional(),
  namaWaliPendamping: z.string().optional(),
  kontakWali: z.string().optional(),
});

export const barangBuktiSchema = z.object({
  jenisZat: z.string().min(1, 'Jenis zat wajib diisi'),
  beratKotorGram: z.number().optional(),
  beratBersihGram: z.number().min(0),
  statusUjiLab: z.enum(['belum_uji', 'proses_lab', 'positif', 'negatif']).default('belum_uji'),
  nomorSuratLab: z.string().optional(),
  tanggalSuratLab: z.string().optional(),
  keterangan: z.string().optional(),
  fotoBarangBuktiUrl: z.string().optional(),
  fotoUjiLabUrl: z.string().optional(),
});

export const perkaraHukumSchema = z.object({
  nomorLaporanPolisi: z.string().min(1, 'Nomor LP wajib diisi'),
  tanggalLp: z.string().min(1, 'Tanggal LP wajib diisi'),
  instansiPenyidik: z.string().min(1, 'Instansi penyidik wajib diisi'),
  namaPenyidik: z.string().min(1, 'Nama penyidik wajib diisi'),
  nomorHpPenyidik: z.string().min(8, 'Nomor HP penyidik minimal 8 digit'),
  pasalDipersangkakan: z.string().min(1, 'Pasal sangkaan wajib diisi'),
  tempatKejadianPerkara: z.string().min(1, 'TKP wajib diisi'),
  tanggalWaktuPenangkapan: z.string().optional(),
  kronologiSingkat: z.string().min(10, 'Kronologi minimal 10 karakter'),
  barangBuktiList: z.array(barangBuktiSchema).default([]),
});

export const createPermohonanSchema = z.object({
  jenisPengajuan: z.enum([
    'penangkapan_tanpa_bb', 'penangkapan_dengan_bb', 'p19', 'penuntutan', 'persidangan'
  ]).optional(),
  metodePelaksanaan: z.enum(['luring', 'daring', 'hybrid']).optional(),
  satuanKerjaTujuan: z.string().optional(),
  terperiksa: terperiksaSchema,
  perkara: perkaraHukumSchema,
});

export const updatePermohonanSchema = z.object({
  jenisPengajuan: z.enum([
    'penangkapan_tanpa_bb', 'penangkapan_dengan_bb', 'p19', 'penuntutan', 'persidangan'
  ]).optional(),
  metodePelaksanaan: z.enum(['luring', 'daring', 'hybrid']).optional(),
  satuanKerjaTujuan: z.string().optional(),
  terperiksa: terperiksaSchema.partial().optional(),
  perkara: perkaraHukumSchema.partial().optional(),
});

export const verifikasiSchema = z.object({
  catatanVerifikasi: z.string().optional(),
  dokumenStatus: z.array(z.object({
    dokumenId: z.string(),
    status: z.enum(['sesuai', 'perlu_perbaikan', 'belum_tersedia', 'tidak_berlaku', 'belum_diperiksa']),
    catatanKoreksi: z.string().optional(),
  })).default([]),
});

export const mintaPerbaikanSchema = z.object({
  catatanPerbaikan: z.string().optional(),
  catatanKoreksi: z.string().optional(),
  dokumenPerluDiperbaiki: z.array(z.object({
    dokumenId: z.string(),
    catatanKoreksi: z.string(),
  })).default([]),
}).transform(val => ({
  catatanPerbaikan: val.catatanPerbaikan || val.catatanKoreksi || 'Perlu perbaikan berkas permohonan',
  dokumenPerluDiperbaiki: val.dokumenPerluDiperbaiki,
}));

export const disposisiSchema = z.object({
  disposisiHasil: z.enum(['disetujui', 'ditolak', 'perlu_pendalaman']),
  disposisiAlasan: z.string().optional().default('Disposisi Ketua Tim Asesmen Terpadu'),
  disposisiKetua: z.string().optional().default('Ketua Tim Asesmen Terpadu'),
  disposisiJabatan: z.string().optional().default('Ketua TAT'),
  disposisiBuktiUrl: z.string().optional(),
});

export const penugasanSchema = z.object({
  asesorMedisId: z.string().optional(),
  asesorMedisNama: z.string().optional(),
  asesorHukumId: z.string().optional(),
  asesorHukumNama: z.string().optional(),
  jadwalPemeriksaanMedis: z.string().optional(),
  jadwalPemeriksaanHukum: z.string().optional(),
  jadwalPleno: z.string().optional(),
  lokasiPemeriksaan: z.string().optional(),
});

export type CreatePermohonanInput = z.infer<typeof createPermohonanSchema>;
export type UpdatePermohonanInput = z.infer<typeof updatePermohonanSchema>;
