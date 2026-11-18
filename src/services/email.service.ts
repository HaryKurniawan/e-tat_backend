/**
 * Email Service E-TAT POLRI (Modularized)
 * 
 * Seluruh komponen email telah dipisahkan ke dalam modul-modul independen:
 * - Core Client & Config : src/services/email/core/client.ts
 * - Helpers & Formatters : src/services/email/core/formatters.ts
 * - Type Definitions    : src/services/email/core/types.ts
 * - Template Surat Akun : src/services/email/templates/persetujuan-akun.email.ts
 * - Template Medis      : src/services/email/templates/penugasan-medis.email.ts
 * - Template Hukum      : src/services/email/templates/penugasan-hukum.email.ts
 * - Template Hasil Medis: src/services/email/templates/notifikasi-medis-selesai.email.ts
 * - Template Permohonan : src/services/email/templates/permohonan-baru.email.ts
 * - Template Surat Jwb  : src/services/email/templates/surat-jawaban.email.ts
 */

export * from './email';
