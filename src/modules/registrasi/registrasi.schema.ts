import { z } from 'zod';

export const registrasiSchema = z.object({
  namaLengkap: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100, 'Nama lengkap maksimal 100 karakter'),
  pangkat: z.string().optional(),
  nrp: z.string().min(4, 'NRP/NIP minimal 4 karakter').max(20, 'NRP/NIP maksimal 20 karakter'),
  jabatan: z.string().min(1, 'Jabatan wajib diisi').max(100, 'Jabatan maksimal 100 karakter'),
  instansi: z.string().min(1, 'Instansi wajib diisi').max(150, 'Instansi maksimal 150 karakter'),
  kategoriInstansi: z.enum([
    'Polres_Polresta', 'Polda', 'Polsek', 'BNNK_BNNP', 'Kejaksaan', 'Lainnya'
  ]),
  wilayahHukum: z.string().min(1, 'Wilayah hukum wajib diisi').max(100, 'Wilayah hukum maksimal 100 karakter'),
  alamatKantor: z.string().min(1, 'Alamat kantor wajib diisi').max(250, 'Alamat kantor maksimal 250 karakter'),
  email: z.string().email('Format email tidak valid').max(100, 'Email maksimal 100 karakter'),
  phone: z.string().min(8, 'Nomor HP minimal 8 digit').max(20, 'Nomor HP maksimal 20 digit'),
  teleponKantor: z.string().max(30, 'Telepon kantor maksimal 30 karakter').optional(),
  fotoKtpUrl: z.string().optional(),
  fotoKtpName: z.string().optional(),
  fotoKtaUrl: z.string().optional(),
  fotoKtaName: z.string().optional(),
  suratPenunjukanUrl: z.string().optional(),
  suratPenunjukanName: z.string().optional(),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter').max(100).optional(),
});

export const approveRegistrasiSchema = z.object({
  catatanAdmin: z.string().optional(),
});

export const rejectRegistrasiSchema = z.object({
  catatanAdmin: z.string().min(1, 'Catatan penolakan wajib diisi'),
});

export type RegistrasiInput = z.infer<typeof registrasiSchema>;
