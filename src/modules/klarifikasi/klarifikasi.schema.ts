import { z } from 'zod';

export const createKlarifikasiSchema = z.object({
  pertanyaan: z.string().min(5, 'Pertanyaan/permintaan klarifikasi minimal 5 karakter'),
  kepadaPeran: z.enum(['ADMIN', 'PENGAJU', 'MEDIS', 'HUKUM']).default('PENGAJU'),
  lampiran: z.string().optional(),
});

export const jawabKlarifikasiSchema = z.object({
  jawaban: z.string().min(2, 'Jawaban klarifikasi wajib diisi'),
});
