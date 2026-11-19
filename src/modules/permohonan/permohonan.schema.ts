import { z } from 'zod';

// =====================================================================
// SCHEMAS UNTUK PERMOHONAN
// =====================================================================

export const terperiksaSchema = z.object({
  namaLengkap: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
  alias: z.string().max(50, 'Alias maksimal 50 karakter').optional().nullable(),
  nik: z.string().regex(/^\d{16}$/, 'NIK harus terdiri dari 16 digit angka').optional().nullable(),
  isNikVerified: z.boolean().default(false),
  statusIdentitasKhusus: z.string().optional().nullable(),
  tempatLahir: z.string().min(1, 'Tempat lahir wajib diisi').max(60, 'Tempat lahir maksimal 60 karakter'),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  usia: z.number().int().min(0, 'Usia minimal 0 tahun').max(120, 'Usia maksimal 120 tahun'),
  jenisKelamin: z.enum(['Laki-laki', 'Perempuan']),
  pekerjaan: z.string().max(80, 'Pekerjaan maksimal 80 karakter').optional().nullable(),
  alamatKtp: z.string().min(1, 'Alamat KTP wajib diisi').max(255, 'Alamat KTP maksimal 255 karakter'),
  alamatDomisili: z.string().max(255, 'Alamat domisili maksimal 255 karakter').optional().nullable(),
  namaWaliPendamping: z.string().max(100, 'Nama wali maksimal 100 karakter').optional().nullable(),
  kontakWali: z.string().max(20, 'Kontak wali maksimal 20 digit').optional().nullable(),
});

export const barangBuktiSchema = z.object({
  jenisZat: z.string().min(1, 'Jenis zat wajib diisi').max(80, 'Jenis zat maksimal 80 karakter'),
  beratKotorGram: z.number().optional().nullable(),
  beratBersihGram: z.number().min(0, 'Berat bersih tidak boleh negatif'),
  statusUjiLab: z.enum(['belum_uji', 'proses_lab', 'positif', 'negatif']).default('belum_uji'),
  nomorSuratLab: z.string().max(80, 'Nomor surat lab maksimal 80 karakter').optional().nullable(),
  tanggalSuratLab: z.string().optional().nullable(),
  keterangan: z.string().max(500, 'Keterangan maksimal 500 karakter').optional().nullable(),
  fotoBarangBuktiUrl: z.string().optional().nullable(),
  fotoUjiLabUrl: z.string().optional().nullable(),
});

export const perkaraHukumSchema = z.object({
  nomorLaporanPolisi: z.string().min(1, 'Nomor LP wajib diisi').max(100, 'Nomor LP maksimal 100 karakter'),
  tanggalLp: z.string().min(1, 'Tanggal LP wajib diisi'),
  instansiPenyidik: z.string().min(1, 'Instansi penyidik wajib diisi').max(100, 'Instansi maksimal 100 karakter'),
  namaPenyidik: z.string().min(1, 'Nama penyidik wajib diisi').max(100, 'Nama penyidik maksimal 100 karakter'),
  nomorHpPenyidik: z.string().min(8, 'Nomor HP penyidik minimal 8 digit').max(20, 'Nomor HP penyidik maksimal 20 digit'),
  pasalDipersangkakan: z.string().min(1, 'Pasal sangkaan wajib diisi').max(200, 'Pasal maksimal 200 karakter'),
  tempatKejadianPerkara: z.string().min(1, 'TKP wajib diisi').max(255, 'TKP maksimal 255 karakter'),
  tanggalWaktuPenangkapan: z.string().optional().nullable(),
  kronologiSingkat: z.string().min(10, 'Kronologi minimal 10 karakter').max(3000, 'Kronologi maksimal 3000 karakter'),
  barangBuktiList: z.array(barangBuktiSchema).default([]),
});

export const dokumenItemSchema = z.object({
  nama: z.string().min(1, 'Nama dokumen wajib diisi'),
  kode: z.string().optional().nullable(),
  wajib: z.boolean().default(true),
  keterangan: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  fileName: z.string().optional().nullable(),
  fileSize: z.string().optional().nullable(),
  statusVerifikasi: z.enum([
    'sesuai', 'perlu_perbaikan', 'belum_tersedia', 'tidak_berlaku', 'belum_diperiksa', 'belum_diunggah'
  ]).default('belum_diunggah'),
  catatanKoreksi: z.string().optional().nullable(),
  versi: z.number().int().default(1),
});

export const createPermohonanSchema = z.object({
  jenisPengajuan: z.enum([
    'penangkapan_tanpa_bb', 'penangkapan_dengan_bb', 'p19', 'penuntutan', 'persidangan'
  ]).optional(),
  metodePelaksanaan: z.enum(['luring', 'daring', 'hybrid']).optional(),
  satuanKerjaTujuan: z.string().optional(),
  terperiksa: terperiksaSchema,
  perkara: perkaraHukumSchema,
  dokumenList: z.array(dokumenItemSchema).optional().default([]),
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
    nama: z.string().optional(),
    kode: z.string().optional(),
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
