import { z } from 'zod';

export const registrasiSchema = z.object({
  namaLengkap: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  pangkat: z.string().optional(),
  nrp: z.string().min(1, 'NRP/NIP wajib diisi'),
  jabatan: z.string().min(1, 'Jabatan wajib diisi'),
  instansi: z.string().min(1, 'Instansi wajib diisi'),
  kategoriInstansi: z.enum([
    'Polres_Polresta', 'Polda', 'Polsek', 'BNNK_BNNP', 'Kejaksaan', 'Lainnya'
  ]),
  wilayahHukum: z.string().min(1, 'Wilayah hukum wajib diisi'),
  alamatKantor: z.string().min(1, 'Alamat kantor wajib diisi'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(8, 'Nomor HP minimal 8 digit'),
  teleponKantor: z.string().optional(),
  fotoKtpUrl: z.string().optional(),
  fotoKtpName: z.string().optional(),
  fotoKtaUrl: z.string().optional(),
  fotoKtaName: z.string().optional(),
  suratPenunjukanUrl: z.string().optional(),
  suratPenunjukanName: z.string().optional(),
});

export const approveRegistrasiSchema = z.object({
  catatanAdmin: z.string().optional(),
});

export const rejectRegistrasiSchema = z.object({
  catatanAdmin: z.string().min(1, 'Catatan penolakan wajib diisi'),
});

export type RegistrasiInput = z.infer<typeof registrasiSchema>;
